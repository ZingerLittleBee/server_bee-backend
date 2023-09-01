use crate::config::config::Config;
use crate::traits::json_response::JsonResponder;
use crate::vo::config::app::AppConfigVo;
use crate::vo::config::server::ServerConfigVo;
use crate::vo::config::web_server::WebServerConfigVo;
use crate::vo::formator::Convert;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConfigVo {
    pub web_server: WebServerConfigVo,
    pub server: ServerConfigVo,
    pub app: AppConfigVo,
}

impl Convert<ConfigVo> for Config {
    fn convert(&self) -> ConfigVo {
        ConfigVo {
            web_server: self.web_server_config().convert(),
            server: self.server_config().convert(),
            app: self.app_config().convert(),
        }
    }
}

impl JsonResponder for ConfigVo {}
