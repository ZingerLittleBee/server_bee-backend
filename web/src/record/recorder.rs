use crate::record::constant::RECORD_ENDPOINT;
use crate::system_info::SystemInfo;
use crate::vo::fusion::Fusion;
use log::{error, info};
use reqwest::{Error, Response};
use serde::{Deserialize, Serialize};
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

pub struct Recorder {}

impl Recorder {
    pub async fn run() {
        let recorder = Recorder {};
        recorder.start().await;
    }

    pub async fn start(&self) {
        self.task().await;
    }

    async fn task(&self) {
        let client = reqwest::Client::new();
        let url = format!("http://localhost:{}{}", 9528, RECORD_ENDPOINT);
        info!("Recorder url: {}", url);

        actix_rt::spawn(async move {
            let mut sys = SystemInfo::new();
            loop {
                match Recorder::recorder_fusion_data(
                    &client,
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
        url: &str,
        fusion: Fusion,
    ) -> Result<Response, Error> {
        let params = Record::new(fusion);
        client.post(url).json(&params).send().await
    }
}
