// use crate::constant::env::AUTH_SERVER_URL;
// use actix_web::error::ErrorInternalServerError;
// use actix_web::http::header;
// use actix_web::{dev::Payload, FromRequest, HttpRequest};
// use log::{debug, error};
// use serde::{Deserialize, Serialize};
// use std::env;
// use std::future::Future;
// use std::pin::Pin;
//
// #[derive(Debug, Serialize, Deserialize)]
// pub struct Auth(String);
//
// impl Auth {
//     pub fn new(req: &HttpRequest) -> Self {
//         Auth(Auth::extract_from_cookie(req))
//     }
//
//     pub async fn validate(&self) -> bool {
//         let auth_server_url = env::var(AUTH_SERVER_URL).expect("AUTH_SERVER_URL must be set");
//
//         debug!("Cookie: {}", &self.0);
//         match reqwest::Client::new()
//             .get(&auth_server_url)
//             .header("Cookie", &self.0)
//             .send()
//             .await
//         {
//             Ok(response) => response.status().is_success(),
//             Err(e) => {
//                 error!("Failed to validate token: {:?}", e);
//                 false
//             }
//         }
//     }
//
//     pub fn extract_from_cookie(req: &HttpRequest) -> String {
//         let cookie_header = req
//             .headers()
//             .get(header::COOKIE)
//             .ok_or_else(|| ErrorInternalServerError("No cookie header"))
//             .unwrap()
//             .to_str()
//             .map_err(ErrorInternalServerError)
//             .unwrap();
//         cookie_header.to_string()
//     }
// }
//
// impl FromRequest for Auth {
//     type Error = actix_web::Error;
//     type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;
//
//     fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
//         let req_clone = req.clone();
//         Box::pin(async move {
//             let token = Auth::new(&req_clone);
//             if token.validate().await {
//                 Ok(token)
//             } else {
//                 Err(ErrorInternalServerError("Auth failed"))
//             }
//         })
//     }
// }
