use crate::config::web_server::WebServerConfig;
use crate::traits::json_response::JsonResponder;
use crate::vo::formator::Convert;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone, Copy)]
pub struct WebServerConfigVo {
    pub port: u16,
}

impl Convert<WebServerConfigVo> for WebServerConfig {
    fn convert(&self) -> WebServerConfigVo {
        WebServerConfigVo { port: self.port() }
    }
}

impl JsonResponder for WebServerConfigVo {}
