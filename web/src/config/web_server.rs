use crate::config::constant::DEFAULT_PORT;
use crate::traits::json_response::JsonResponder;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone, Copy)]
pub struct WebServerConfig {
    port: u16,
}

impl WebServerConfig {
    pub fn new(port: u16) -> Self {
        WebServerConfig { port }
    }

    pub fn merge(&mut self, other: &WebServerConfig) {
        self.port = other.port;
    }

    pub fn port(&self) -> u16 {
        self.port
    }

    pub fn set_port(&mut self, port: u16) {
        self.port = port;
    }
}

impl JsonResponder for WebServerConfig {}

impl Default for WebServerConfig {
    fn default() -> Self {
        WebServerConfig { port: DEFAULT_PORT }
    }
}
