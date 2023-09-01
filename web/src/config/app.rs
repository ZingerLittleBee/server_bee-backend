use crate::traits::json_response::JsonResponder;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub struct AppConfig {
    token: Option<String>,
}

impl AppConfig {
    pub fn new(token: Option<String>) -> Self {
        AppConfig { token }
    }
    pub fn token(&self) -> Option<String> {
        self.token.clone()
    }

    pub fn set_token(&mut self, token: Option<String>) {
        self.token = token
    }
}

impl JsonResponder for AppConfig {}
