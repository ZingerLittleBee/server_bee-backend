use actix_web::{web, Responder};
use std::sync::{Arc, RwLock};

use crate::config::config::Config;
use crate::handler::result::HttpResult;
use crate::traits::json_response::JsonResponse;
use crate::vo::config::config::ConfigVo;
use crate::vo::formator::Convert;

pub async fn get_config(config: web::Data<Arc<RwLock<Config>>>) -> impl Responder {
    let config = config.read().unwrap().clone().convert();
    JsonResponse(HttpResult::<ConfigVo>::success(Some(config)))
}

pub async fn get_server_config(config: web::Data<Arc<RwLock<Config>>>) -> impl Responder {
    let config = config.read().unwrap().clone().convert();
    JsonResponse(HttpResult::<ConfigVo>::success(Some(config)))
}
