use crate::traits::json_response::JsonResponder;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone, Default)]
pub struct AppConfig {
    token: Option<String>,
}

impl AppConfig {
    pub fn new(token: Option<String>) -> Self {
        AppConfig { token }
    }

    pub fn merge(&mut self, other: AppConfig) -> bool {
        let mut merged = false;
        if other.token.is_some() {
            self.token = other.token.clone();
            merged = true;
        }
        merged
    }

    pub fn token(&self) -> Option<String> {
        self.token.clone()
    }

    pub fn set_token(&mut self, token: Option<String>) {
        self.token = token
    }
}

impl JsonResponder for AppConfig {}
