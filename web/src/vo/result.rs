use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct HttpResult {
    pub success: bool,
    pub message: String,
}
