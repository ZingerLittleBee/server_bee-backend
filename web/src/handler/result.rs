use actix_web::body::BoxBody;
use actix_web::http::header::ContentType;
use actix_web::{HttpRequest, HttpResponse, Responder};
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

impl Responder for HttpResult {
    type Body = BoxBody;

    fn respond_to(self, _req: &HttpRequest) -> HttpResponse<Self::Body> {
        let body = serde_json::to_string(&self).unwrap();

        // Create response and set content type
        HttpResponse::Ok()
            .content_type(ContentType::json())
            .body(body)
    }
}
