use crate::config::app::AppConfig;
use crate::traits::json_response::JsonResponder;
use crate::vo::formator::Convert;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub struct AppConfigVo {
    token: Option<String>,
}

impl Convert<AppConfigVo> for AppConfig {
    fn convert(&self) -> AppConfigVo {
        AppConfigVo {
            token: self.token(),
        }
    }
}

impl JsonResponder for AppConfigVo {}
