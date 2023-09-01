use actix_web::{web, Responder};
use std::sync::{Arc, RwLock};

use crate::config::config::Config;
use crate::handler::result::HttpResult;
use crate::traits::json_response::JsonResponse;
use crate::vo::config::app::AppConfigVo;
use crate::vo::config::config::ConfigVo;
use crate::vo::config::server::ServerConfigVo;
use crate::vo::config::web_server::WebServerConfigVo;
use crate::vo::formator::Convert;

pub async fn get_config(config: web::Data<Arc<RwLock<Config>>>) -> impl Responder {
    let config = config.read().unwrap().clone().convert();
    JsonResponse(HttpResult::<ConfigVo>::success(Some(config)))
}

pub async fn get_server_config(config: web::Data<Arc<RwLock<Config>>>) -> impl Responder {
    let config = config.read().unwrap().clone().convert();
    JsonResponse(HttpResult::<ServerConfigVo>::success(Some(config.server)))
}

pub async fn get_app_config(config: web::Data<Arc<RwLock<Config>>>) -> impl Responder {
    let config = config.read().unwrap().clone().convert();
    JsonResponse(HttpResult::<AppConfigVo>::success(Some(config.app)))
}

pub async fn get_web_server_config(config: web::Data<Arc<RwLock<Config>>>) -> impl Responder {
    let config = config.read().unwrap().clone().convert();
    JsonResponse(HttpResult::<WebServerConfigVo>::success(Some(
        config.web_server,
    )))
}
