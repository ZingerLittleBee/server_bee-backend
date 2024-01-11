use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct HttpResult<T> {
    pub success: bool,
    pub message: Option<String>,
    pub data: Option<T>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Token {
    pub token: String,
}

pub type RegisterResult = HttpResult<Token>;
