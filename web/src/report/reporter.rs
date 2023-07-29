use std::sync::{Arc, RwLock};
use crate::system_info::SystemInfo;
use crate::vo::formator::Convert;
use crate::vo::fusion::Fusion;
use crate::vo::result::RegisterResult;
use log::{error, info, warn};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use crate::config::config::Config;

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
    config: Arc<RwLock<Config>>
}

impl Reporter {
    pub async fn new(config: Arc<RwLock<Config>>) -> Self {
        let reporter = Reporter {
            config
        };
        reporter.start().await;
        reporter
    }

    pub async fn start(&self) {
        // let config = ClientConfig::new("ws://127.0.0.1:9876").bearer("test_token");
        // let (_, future) = ezsockets::connect(|handle| Client::new(handle, None), config).await;
        // tokio::spawn(async move {
        //     future.await.unwrap();
        // });
        let token = self.config.read().unwrap().client_token();
        let server_host = self.config.read().unwrap().server_host();
        if token.is_none() || server_host.is_none() {
            warn!("Token or server host is empty, will not start report thread!");
            return;
        }
        info!("token: {:?}", token)
    }

    async fn check_token(&self, token: String) -> Result<(), actix_web::Error> {
        let server_host = self.config.read().unwrap().server_host();
        let client = awc::Client::default();
        match client
            .get("http://localhost:3000/client/verify")
            .bearer_auth(token)
            .send()
            .await
        {
            Ok(res) => match res.status() {
                status if status.is_success() => Ok(()),
                status if status.is_client_error() => Err(actix_web::error::ErrorUnauthorized("Unauthorized!")),
                _ => {
                    error!("Unexpected status code: {:?}", res.status().as_u16());
                    Err(actix_web::error::ErrorUnauthorized("Unauthorized!"))
                },
            },
            Err(err) => {
                error!("Error request while checking token: {:?}", err);
                Err(actix_web::error::ErrorBadRequest("Bad request!"))
            }
        }
    }

    async fn register() -> String {
        let mut sys = SystemInfo::new();

        let device_info = sys.get_device_info().convert();

        // debug!("register device info: {device_info:?}");

        let client = awc::Client::default();
        match client
            .post("http://127.0.0.1:3000/client/register")
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
