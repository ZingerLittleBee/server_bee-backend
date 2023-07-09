use crate::system_info::SystemInfo;
use crate::vo::fusion::Fusion;
use log::{debug, info};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use crate::vo::formator::Convert;
use crate::vo::result::{HttpResult, RegisterResult};


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
            time: Report::get_current_timestamp()
        }
    }
    fn get_current_timestamp() -> u64 {
        let now = SystemTime::now();
        let timestamp = now.duration_since(UNIX_EPOCH).expect("Time went backwards");
        let secs = timestamp.as_secs();
        secs
    }
}

pub struct Reporter;

impl Reporter {
    pub async fn start() {
        // let config = ClientConfig::new("ws://127.0.0.1:9876").bearer("test_token");
        // let (_, future) = ezsockets::connect(|handle| Client::new(handle, None), config).await;
        // tokio::spawn(async move {
        //     future.await.unwrap();
        // });
    }

    async fn get_token() -> String {
        let db = sled::open("db").unwrap();
        let token = db.get("token").unwrap();
        match token {
            Some(token) =>  String::from_utf8(token.to_vec()).unwrap(),
            None => {
                let token = Reporter::register().await;
                db.insert("token", token.as_str()).unwrap();
                token
            }
        }
    }

    async fn check_token(token: String) {
        let client = awc::Client::default();
        //
    }

    async fn register() -> String {
        let mut sys = SystemInfo::new();

        let device_info = sys.get_device_info().convert();

        info!("register device info: {device_info:?}");

        let client = awc::Client::default();
        match client.post("http://127.0.0.1:8765/client/register")
            .send_json(&device_info)
            .await {
            Ok(mut res) => {
                match res.json::<RegisterResult>().await {
                    Ok(res) => {
                        info!("Register response: {res:?}");
                        if res.success {
                            res.data.token
                        } else {
                            panic!("register failed: {}", res.message);
                        }
                    },
                    Err(err) => {
                        panic!("Register error while parsing response to JSON: {:?}", err);
                    }
                }
            },
            Err(err) => {
                panic!("Register error while parsing JSON: {:?}", err);
            }
        }
    }
}
