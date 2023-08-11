use crate::config::config::Config;
use crate::handler::http_handler::TokenInfo;
use actix_web::{web, HttpResponse, Responder};
use log::warn;
use std::sync::{Arc, RwLock};

// /client/token/rest
pub async fn set_client_token(
    config: web::Data<Arc<RwLock<Config>>>,
    info: web::Json<TokenInfo>,
) -> HttpResponse {
    warn!("Local Event: set_client_token");
    HttpResponse::from(match config.write() {
        Ok(mut c) => match c.set_client_token(info.token.as_str()) {
            Ok(_) => HttpResponse::Ok(),
            Err(_) => HttpResponse::InternalServerError(),
        },
        Err(_) => HttpResponse::InternalServerError(),
    })
}

// /client/token/rest
pub async fn view_client_token(config: web::Data<Arc<RwLock<Config>>>) -> impl Responder {
    warn!("Local Event: view_client_token");
    match config.read() {
        Ok(c) => {
            let token = c.client_token();
            token.unwrap_or("".into())
        }
        Err(_) => "".into(),
    }
}
