use crate::config::app::AppConfig;
use crate::config::config::Config;
use crate::config::server::ServerConfig;
use crate::config::web_server::WebServerConfig;
use crate::traits::json_response::JsonResponder;
use crate::vo::formator::Convert;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConfigVo {
    web_server: WebServerConfig,
    server: ServerConfig,
    app: AppConfig,
}

impl Convert<ConfigVo> for Config {
    fn convert(&self) -> ConfigVo {
        ConfigVo {
            web_server: self.web_server_config(),
            server: self.server_config(),
            app: self.app_config(),
        }
    }
}

impl JsonResponder for ConfigVo {}
