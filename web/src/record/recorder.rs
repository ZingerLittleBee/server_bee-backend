use crate::config::config::Config;
use crate::record::constant::{RECORD_ENDPOINT, SLEEP_TIME_SECOND_RETRY};
use crate::system_info::SystemInfo;
use crate::vo::fusion::Fusion;
use log::{debug, error, warn};
use reqwest::{Error, Response};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, RwLock};
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::time::{sleep, Duration};

#[derive(Debug, Serialize, Deserialize)]
pub struct Record {
    fusion: Fusion,
    time: u64,
}

impl Record {
    pub fn new(fusion: Fusion) -> Self {
        Self {
            fusion,
            time: Record::get_current_timestamp(),
        }
    }
    fn get_current_timestamp() -> u64 {
        let now = SystemTime::now();
        let timestamp = now.duration_since(UNIX_EPOCH).expect("Time went backwards");
        let secs = timestamp.as_secs();
        secs
    }
}

pub struct Recorder {
    config: Arc<RwLock<Config>>,
}

impl Recorder {
    pub async fn run(config: Arc<RwLock<Config>>) {
        let recorder = Recorder { config };
        recorder.start().await;
    }

    pub async fn start(&self) {
        self.task().await;
    }

    async fn task(&self) {
        let client = reqwest::Client::new();
        let config = self.config.clone();
        actix_rt::spawn(async move {
            let mut sys = SystemInfo::new();
            loop {
                let server_config = match config.read() {
                    Ok(config) => config.server_config(),
                    Err(err) => {
                        error!("Failed reading config, error: {:?}", err);
                        sleep(Duration::from_secs(1)).await;
                        continue;
                    }
                };

                if server_config.token().is_none() || server_config.url().is_none() {
                    sleep(Duration::from_secs(SLEEP_TIME_SECOND_RETRY)).await;
                    warn!(
                        "Server URL or Token is none, retry after {} seconds",
                        SLEEP_TIME_SECOND_RETRY
                    );
                    continue;
                }

                let url = format!("{}{}", server_config.url().unwrap(), RECORD_ENDPOINT);
                debug!("Server URL: {}", url);

                let token = server_config.token().unwrap();
                debug!("Token is: {}", token);

                match Recorder::recorder_fusion_data(
                    &client,
                    token,
                    &url,
                    sys.get_fusion_with_simple_process(),
                )
                .await
                {
                    Ok(_) => {
                        sleep(Duration::from_secs(1)).await;
                    }
                    Err(err) => {
                        error!("Record data failed, error: {:?}", err);
                        sleep(Duration::from_secs(SLEEP_TIME_SECOND_RETRY)).await;
                    }
                }
            }
        });
    }

    async fn recorder_fusion_data(
        client: &reqwest::Client,
        token: String,
        url: &str,
        fusion: Fusion,
    ) -> Result<Response, Error> {
        let params = Record::new(fusion);
        client
            .post(url)
            .header("Authorization", format!("Bearer {}", token))
            .json(&params)
            .send()
            .await
    }
}
