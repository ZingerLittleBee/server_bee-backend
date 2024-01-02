use crate::config::config::Config;
use crate::record::constant::{RECORD_ENDPOINT, SLEEP_TIME_SECOND_RETRY};
use crate::system_info::SystemInfo;
use crate::vo::fusion::Fusion;
use log::{error, info, warn};
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
        let url = format!("http://localhost:{}{}", 9528, RECORD_ENDPOINT);
        info!("Recorder url: {}", url);

        let config = self.config.clone();

        actix_rt::spawn(async move {
            let mut sys = SystemInfo::new();
            loop {
                let token = match config.read() {
                    Ok(config) => config.server_token(),
                    Err(err) => {
                        error!("Failed reading config, error: {:?}", err);
                        sleep(Duration::from_secs(1)).await;
                        continue;
                    }
                };

                if token.is_none() {
                    sleep(Duration::from_secs(SLEEP_TIME_SECOND_RETRY)).await;
                    warn!(
                        "Token is none, retry after {} seconds",
                        SLEEP_TIME_SECOND_RETRY
                    );
                    continue;
                }

                match Recorder::recorder_fusion_data(
                    &client,
                    token.unwrap(),
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

    fn get_token(&self) -> Option<String> {
        self.config.read().unwrap().server_token()
    }
}
