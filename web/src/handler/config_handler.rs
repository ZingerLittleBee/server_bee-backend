use crate::config::app::AppConfig;
use actix_web::{web, Responder};
use std::sync::{Arc, RwLock};

use crate::config::config::Config;
use crate::config::server::ServerConfig;
use crate::config::web_server::WebServerConfig;
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

pub async fn set_server_config(
    config: web::Data<Arc<RwLock<Config>>>,
    server_config: web::Json<ServerConfig>,
) -> impl Responder {
    let mut config = config.write().unwrap();
    let mut server = config.server_config();
    server.merge(server_config.into_inner());
    match config.set_server_config(server) {
        Ok(_) => JsonResponse(HttpResult::<()>::success(Some(()))),
        Err(e) => JsonResponse(HttpResult::<()>::error(e.to_string())),
    }
}

pub async fn get_app_config(config: web::Data<Arc<RwLock<Config>>>) -> impl Responder {
    let config = config.read().unwrap().clone().convert();
    JsonResponse(HttpResult::<AppConfigVo>::success(Some(config.app)))
}

pub async fn set_app_config(
    config: web::Data<Arc<RwLock<Config>>>,
    app_config: web::Json<AppConfig>,
) -> impl Responder {
    let mut config = config.write().unwrap();
    let mut app = config.app_config();
    app.merge(app_config.into_inner());
    match config.set_app_config(app) {
        Ok(_) => JsonResponse(HttpResult::<()>::success(Some(()))),
        Err(e) => JsonResponse(HttpResult::<()>::error(e.to_string())),
    }
}

pub async fn get_web_server_config(config: web::Data<Arc<RwLock<Config>>>) -> impl Responder {
    let config = config.read().unwrap().clone().convert();
    JsonResponse(HttpResult::<WebServerConfigVo>::success(Some(
        config.web_server,
    )))
}

pub async fn set_web_server_config(
    config: web::Data<Arc<RwLock<Config>>>,
    web_server_config: web::Json<WebServerConfig>,
) -> impl Responder {
    let mut config = config.write().unwrap();
    let mut web_server = config.web_server_config();
    web_server.merge(web_server_config.into_inner());
    match config.set_web_server_config(web_server) {
        Ok(_) => JsonResponse(HttpResult::<()>::success(Some(()))),
        Err(e) => JsonResponse(HttpResult::<()>::error(e.to_string())),
    }
}
