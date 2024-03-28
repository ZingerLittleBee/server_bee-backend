use crate::traits::json_response::JsonResponder;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct ServerConfig {
    enable_record: bool,
    token: Option<String>,
    url: Option<String>,
    record_interval: Option<u64>,
}

impl ServerConfig {
    pub fn new(
        enable_record: bool,
        token: Option<String>,
        url: Option<String>,
        record_interval: Option<u64>,
    ) -> Self {
        ServerConfig {
            enable_record,
            token,
            url,
            record_interval,
        }
    }

    /// Merge the other ServerConfig into self.
    /// Returns true if any of the fields were changed.
    pub fn merge(&mut self, other: ServerConfig) -> bool {
        let mut merged = false;

        if other.enable_record != self.enable_record {
            self.enable_record = other.enable_record;
            merged = true;
        }

        if other.record_interval.is_some() && other.record_interval != self.record_interval {
            self.record_interval = other.record_interval;
            merged = true;
        }

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

    pub fn enable_record(&self) -> bool {
        self.enable_record
    }

    pub fn token(&self) -> Option<String> {
        self.token.clone()
    }

    pub fn url(&self) -> Option<String> {
        self.url.clone()
    }

    pub fn record_interval(&self) -> Option<u64> {
        self.record_interval
    }
}

impl JsonResponder for ServerConfig {}
