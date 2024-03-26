use crate::config::server::ServerConfig;
use crate::traits::json_response::JsonResponder;
use crate::vo::formator::Convert;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ServerConfigVo {
    pub enable_record: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub token: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub record_interval: Option<u64>,
}

impl Convert<ServerConfigVo> for ServerConfig {
    fn convert(&self) -> ServerConfigVo {
        ServerConfigVo {
            enable_record: self.enable_record(),
            token: self.token(),
            url: self.url(),
            record_interval: self.record_interval(),
        }
    }
}

impl JsonResponder for ServerConfigVo {}
