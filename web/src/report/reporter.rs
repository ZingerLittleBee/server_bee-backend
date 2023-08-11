use crate::config::config::Config;
use crate::report::client::Client;
use crate::report::constant::{CHECK_TOKEN_ENDPOINT, REGISTER_ENDPOINT};
use crate::system_info::SystemInfo;
use crate::vo::formator::Convert;
use crate::vo::fusion::Fusion;
use crate::vo::result::RegisterResult;
use actix_web::web::post;
use ezsockets::ClientConfig;
use log::{error, info, warn};
use reqwest::{Error, Response};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, RwLock};
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::time::{sleep, Duration};

#[derive(Debug, Serialize, Deserialize)]
pub struct Report {
    token: String,
    fusion: Fusion,
    time: u64,
}

impl Report {
    pub fn new(token: String, fusion: Fusion) -> Self {
        Self {
            token,
            fusion,
            time: Report::get_current_timestamp(),
        }
    }
    fn get_current_timestamp() -> u64 {
        let now = SystemTime::now();
        let timestamp = now.duration_since(UNIX_EPOCH).expect("Time went backwards");
        let secs = timestamp.as_secs();
        secs
    }

    pub fn set_token(&mut self, token: String) {
        self.token = token;
    }
}

pub struct Reporter {
    config: Arc<RwLock<Config>>,
}

impl Reporter {
    pub async fn new(config: Arc<RwLock<Config>>) -> Self {
        let reporter = Reporter { config };
        reporter.start().await;
        reporter
    }

    pub async fn start(&self) {
        let token = self.config.read().unwrap().client_token();
        let server_host = self.config.read().unwrap().server_host();
        if token.is_none() || server_host.is_none() {
            warn!("Token or server host is empty, will not start report thread!");
            return;
        }
        match self.check_token().await {
            Ok(_) => {
                info!("Token is valid, will start report thread!");
                self.register().await;
                self.connect().await;
                self.task().await;
            }
            Err(err) => {
                error!("Token is invalid, will not start report thread!");
                error!("Error: {:?}", err);
            }
        }
    }

    async fn task(&self) {
        let client = reqwest::Client::new();
        let url = self.http_url();
        let config = self.config.clone();

        actix_rt::spawn(async move {
            let mut sys = SystemInfo::new();
            let mut retry_count = 0;
            loop {
                let token = config
                    .read()
                    .unwrap()
                    .client_token()
                    .expect("Token is empty!");
                match Reporter::send_persistent_data(
                    &client,
                    token,
                    &url,
                    sys.get_fusion_with_full_process(),
                )
                .await
                {
                    Ok(_) => {
                        retry_count = 0;
                        sleep(Duration::from_secs(30 * 60)).await;
                    }
                    Err(err) => {
                        error!("Send persistent data failed!");
                        error!("Error: {:?}", err);
                        // retry after 5 minutes if failed
                        // max retry count is 5, if failed 5 times, then retry after 30 minutes
                        retry_count += 1;
                        if retry_count >= 5 {
                            retry_count = 0;
                            sleep(Duration::from_secs(30 * 60)).await;
                        } else {
                            sleep(Duration::from_secs(5 * 60)).await;
                        }
                    }
                }
            }
        });
    }

    async fn send_persistent_data(
        client: &reqwest::Client,
        token: String,
        url: &String,
        fusion: Fusion,
    ) -> Result<Response, Error> {
        let params = Report::new(token.clone(), fusion);
        client
            .post(url)
            .header("Authorization", format!("Bearer {}", token))
            .json(&params)
            .send()
            .await
    }

    async fn connect(&self) {
        let (_, future) =
            ezsockets::connect(|handle| Client::new(handle, None), self.ws_config()).await;
        tokio::spawn(async move {
            future.await.unwrap();
        });
    }

    fn ws_config(&self) -> ClientConfig {
        let config = ClientConfig::new(self.ws_url().as_str()).bearer(self.get_token());
        config
    }

    fn ws_url(&self) -> String {
        let server_host = self.config.read().unwrap().server_host();
        format!("ws://{}:9876", server_host.unwrap())
    }

    fn http_url(&self) -> String {
        let server_host = self.config.read().unwrap().server_host();
        format!("https://{}", server_host.unwrap())
    }

    fn check_token_url(&self) -> String {
        format!("{}{}", self.http_url(), CHECK_TOKEN_ENDPOINT)
    }

    fn get_token(&self) -> String {
        let token = self.config.read().unwrap().client_token();
        token.expect("Token is empty!")
    }

    async fn check_token(&self) -> Result<(), actix_web::Error> {
        let client = awc::Client::default();
        match client
            .get(self.check_token_url())
            .bearer_auth(self.get_token())
            .send()
            .await
        {
            Ok(res) => match res.status() {
                status if status.is_success() => Ok(()),
                status if status.is_client_error() => {
                    Err(actix_web::error::ErrorUnauthorized("Unauthorized!"))
                }
                _ => {
                    error!("Unexpected status code: {:?}", res.status().as_u16());
                    Err(actix_web::error::ErrorUnauthorized("Unauthorized!"))
                }
            },
            Err(err) => {
                error!("Error request while checking token: {:?}", err);
                Err(actix_web::error::ErrorBadRequest("Bad request!"))
            }
        }
    }

    fn register_url(&self) -> String {
        format!("{}{}", self.http_url(), REGISTER_ENDPOINT)
    }

    async fn register(&self) -> String {
        let mut sys = SystemInfo::new();

        let device_info = sys.get_device_info().convert();

        let client = awc::Client::default();
        match client
            .post(self.register_url())
            .send_json(&device_info)
            .await
        {
            Ok(mut res) => match res.json::<RegisterResult>().await {
                Ok(res) => {
                    info!("Register response: {res:?}");
                    if res.success {
                        res.data.map(|token| token.token).unwrap()
                    } else {
                        panic!("register failed: {:?}", res.message);
                    }
                }
                Err(err) => {
                    panic!("Register error while parsing response to JSON: {:?}", err);
                }
            },
            Err(err) => {
                panic!("Register error while parsing JSON: {:?}", err);
            }
        }
    }
}
