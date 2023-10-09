use crate::traits::json_response::JsonResponder;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct HttpResult<T: JsonResponder> {
    success: bool,

    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<T>,
}

impl<T: JsonResponder> HttpResult<T> {
    pub fn new(success: bool) -> HttpResult<T> {
        HttpResult {
            success,
            message: None,
            data: None,
        }
    }

    pub fn success(data: Option<T>) -> HttpResult<T> {
        HttpResult {
            success: true,
            message: None,
            data,
        }
    }

    pub fn error(message: String) -> HttpResult<T> {
        HttpResult {
            success: false,
            message: Some(message),
            data: None,
        }
    }

    pub fn new_msg(success: bool, message: String) -> HttpResult<T> {
        HttpResult {
            success,
            message: Some(message),
            data: None,
        }
    }
}
impl<T: JsonResponder> JsonResponder for HttpResult<T> {}
