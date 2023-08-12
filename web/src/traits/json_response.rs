use actix_web::body::BoxBody;
use actix_web::http::header::ContentType;
use actix_web::{HttpRequest, HttpResponse, Responder};
use serde::Serialize;

pub trait JsonResponder: Serialize + Sized {}

#[derive(Serialize)]
pub struct JsonResponse<T: JsonResponder>(pub T);

impl<T: JsonResponder> Responder for JsonResponse<T> {
    type Body = BoxBody;
    fn respond_to(self, _req: &HttpRequest) -> HttpResponse<Self::Body> {
        let body = serde_json::to_string(&self).unwrap();

        HttpResponse::Ok()
            .content_type(ContentType::json())
            .body(body)
    }
}
