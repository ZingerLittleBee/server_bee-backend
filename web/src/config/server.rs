use crate::traits::json_response::JsonResponder;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone, Default)]
pub struct ServerConfig {
    token: Option<String>,
    host: Option<String>,
    disable_ssl: bool,
}

impl ServerConfig {
    pub fn new(token: Option<String>, host: Option<String>, disable_ssl: bool) -> Self {
        ServerConfig {
            token,
            host,
            disable_ssl,
        }
    }

    /// Merge the other ServerConfig into self.
    /// Returns true if any of the fields were changed.
    pub fn merge(&mut self, other: ServerConfig) -> bool {
        let mut merged = false;
        if other.token.is_some() && other.token != self.token {
            self.token = other.token.clone();
            merged = true;
        }
        if other.host.is_some() && other.host != self.host {
            self.host = other.host.clone();
            merged = true;
        }
        if other.disable_ssl != self.disable_ssl {
            self.disable_ssl = other.disable_ssl;
            merged = true;
        }
        merged
    }

    pub fn token(&self) -> Option<String> {
        self.token.clone()
    }

    pub fn host(&self) -> Option<String> {
        self.host.clone()
    }

    pub fn disable_ssl(&self) -> bool {
        self.disable_ssl
    }

    pub fn set_token(&mut self, token: Option<String>) {
        self.token = token;
    }

    pub fn set_host(&mut self, host: Option<String>) {
        self.host = host;
    }

    pub fn set_disable_ssl(&mut self, disable_ssl: bool) {
        self.disable_ssl = disable_ssl;
    }
}

impl JsonResponder for ServerConfig {}
