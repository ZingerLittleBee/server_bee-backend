use crate::config::config::{ClientConfig, Config};
use crate::handler::http_handler::TokenInfo;
use actix_web::{web, HttpResponse, Responder};
use log::warn;
use serde_json::Value;
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

/// GET /client/config
pub async fn view_client_config(config: web::Data<Arc<RwLock<Config>>>) -> impl Responder {
    warn!("Local Event: view_client_token");
    match config.read() {
        Ok(c) => HttpResponse::Ok().json(c.client_config()),
        Err(_) => HttpResponse::Forbidden().json(Value::Object(Default::default())),
    }
}

/// POST /client/config/
pub async fn set_client_config(
    config: web::Data<Arc<RwLock<Config>>>,
    data: web::Json<ClientConfig>,
) -> HttpResponse {
    warn!("Local Event: Set Client Config");
    HttpResponse::from(match config.write() {
        Ok(mut c) => match c.set_client_config(data.0) {
            Ok(_) => HttpResponse::Ok(),
            Err(_) => HttpResponse::InternalServerError(),
        },
        Err(_) => HttpResponse::InternalServerError(),
    })
}
