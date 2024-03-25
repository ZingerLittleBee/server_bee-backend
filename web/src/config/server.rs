use crate::traits::json_response::JsonResponder;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone, Default)]
pub struct ServerConfig {
    token: Option<String>,
    url: Option<String>,
}

impl ServerConfig {
    pub fn new(token: Option<String>, url: Option<String>) -> Self {
        ServerConfig { token, url }
    }

    /// Merge the other ServerConfig into self.
    /// Returns true if any of the fields were changed.
    pub fn merge(&mut self, other: ServerConfig) -> bool {
        let mut merged = false;
        if other.token.is_some() && other.token != self.token {
            self.token = other.token.clone();
            merged = true;
        }
        if other.url.is_some() && other.url != self.url {
            self.url = other.url.clone();
            merged = true;
        }
        merged
    }

    pub fn token(&self) -> Option<String> {
        self.token.clone()
    }

    pub fn url(&self) -> Option<String> {
        self.url.clone()
    }
}

impl JsonResponder for ServerConfig {}
