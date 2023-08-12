use crate::traits::json_response::JsonResponder;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct HttpResult {
    success: bool,

    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

impl HttpResult {
    pub fn new(success: bool) -> HttpResult {
        HttpResult {
            success,
            message: None,
        }
    }

    pub fn new_msg(success: bool, message: String) -> HttpResult {
        HttpResult {
            success,
            message: Some(message),
        }
    }
}
impl JsonResponder for HttpResult {}
