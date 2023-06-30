use async_trait::async_trait;
use ezsockets::ClientConfig;
use serde_json::json;
use tokio::time::{sleep, Duration};
use crate::system_info::SystemInfo;

struct Client {
    sys: SystemInfo
}

impl Client {
    pub fn new() -> Self {
        Self {
            sys: SystemInfo::new()
        }
    }
}

#[async_trait]
impl ezsockets::ClientExt for Client {
    type Call = ();

    async fn on_text(&mut self, text: String) -> Result<(), ezsockets::Error> {
        tracing::info!("received message: {text}");
        Ok(())
    }

    async fn on_binary(&mut self, bytes: Vec<u8>) -> Result<(), ezsockets::Error> {
        tracing::info!("received bytes: {bytes:?}");
        Ok(())
    }

    async fn on_call(&mut self, call: Self::Call) -> Result<(), ezsockets::Error> {
        let () = call;
        Ok(())
    }
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let config = ClientConfig::new("ws://localhost:9876");
    let (handle, future) = ezsockets::connect(|_client| Client::new(), config).await;
    tokio::spawn(async move {
        future.await.unwrap();
    });

    loop {
        handle.text(json!({"event": "test","data":"1231241"}).to_string());
        sleep(Duration::from_secs(5)).await;
    }
}

pub struct Report;

impl Report {

}
