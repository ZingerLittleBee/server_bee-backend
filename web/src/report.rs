use std::sync::Arc;
use async_trait::async_trait;
use ezsockets::ClientConfig;
use log::info;
use serde_json::json;
use tokio::sync::RwLock;
use tokio::time::Duration;
use tokio_util::sync::CancellationToken;
use crate::system_info::SystemInfo;

#[derive(Copy, Clone, Debug, PartialEq)]
enum ReportMode {
    Realtime,
    Interval,
}

struct Client {
    sys: SystemInfo,
    mode: Arc<RwLock<ReportMode>>,
    cancel_token: CancellationToken,
    handle: ezsockets::Client<Self>,
    interval: Arc<RwLock<Duration>>,
}

impl Client {
    pub fn new(handle: ezsockets::Client<Self>, interval: Option<Duration>) -> Self {
        Self {
            handle,
            sys: SystemInfo::new(),
            mode: Arc::new(RwLock::new(ReportMode::Interval)),
            cancel_token: CancellationToken::new(),
            interval: Arc::new(RwLock::new(interval.unwrap_or(Duration::from_secs(60)))),
        }
    }
    pub fn start(&mut self) {
        let interval = self.interval.clone();
        let mode = self.mode.clone();
        let cancel_token = self.cancel_token.clone();
        let handle = self.handle.clone();
        tokio::spawn(async move {
            loop {
                let sleep_duration = if *mode.read().await == ReportMode::Realtime {
                    Duration::from_secs(1)
                } else {
                    *interval.read().await
                };
                println!("sleep_duration: {:?}", sleep_duration);
                tokio::select! {
                _ = cancel_token.cancelled() => {
                    info!("cancelled");
                    break;
                }
                _ = tokio::time::sleep(sleep_duration) => {
                    info!("sending message");
                    handle.text(json!({"event": "test","data":"1231241222"}).to_string());
                }
            }
            }
        });
    }

    async fn set_mode(&mut self, mode: ReportMode) {
        *self.mode.write().await = mode;
    }

    async fn set_interval(&mut self, interval: Duration) {
        *self.interval.write().await = interval;
    }

    async fn cancel(&mut self) {
        self.cancel_token.cancel();
    }
}

#[async_trait]
impl ezsockets::ClientExt for Client {
    type Call = ();

    async fn on_text(&mut self, text: String) -> Result<(), ezsockets::Error> {
        info!("received message: {text}");
        Ok(())
    }

    async fn on_binary(&mut self, bytes: Vec<u8>) -> Result<(), ezsockets::Error> {
        info!("received bytes: {bytes:?}");
        Ok(())
    }

    async fn on_call(&mut self, call: Self::Call) -> Result<(), ezsockets::Error> {
        let () = call;
        println!("on_call");
        self.start();
        Ok(())
    }
}

pub struct Reporter;

impl Reporter {
    pub async fn start() {
        let config = ClientConfig::new("ws://127.0.0.1:9876");
        let (handle, future) = ezsockets::connect(|handle| Client::new(handle, None), config).await;
        tokio::spawn(async move {
            future.await.unwrap();
        });
        handle.call(());
    }
}
