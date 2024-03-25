use crate::config::server::ServerConfig;
use crate::traits::json_response::JsonResponder;
use crate::vo::formator::Convert;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub struct ServerConfigVo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub token: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
}

impl Convert<ServerConfigVo> for ServerConfig {
    fn convert(&self) -> ServerConfigVo {
        ServerConfigVo {
            token: self.token(),
            url: self.url(),
        }
    }
}

impl JsonResponder for ServerConfigVo {}
