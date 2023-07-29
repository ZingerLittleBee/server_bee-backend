use actix_web::{web, HttpResponse};
use std::sync::{Arc, RwLock};
use crate::config::config::Config;

pub async fn db_test(config: web::Data<Arc<RwLock<Config>>>) -> HttpResponse {
    let host = config.read().unwrap().server_host();
    HttpResponse::Ok().body(format!("value = {:?}", host))
}

pub async fn config_test(
    config: web::Data<Arc<RwLock<Config>>>,
) -> HttpResponse {
    config.write().unwrap().set_server_host("https://localhost:3001").unwrap();
    HttpResponse::Ok().body(format!("ok"))
}
