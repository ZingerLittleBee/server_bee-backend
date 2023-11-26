use crate::config::app::AppConfig;
use crate::config::config::Config;
use crate::config::server::ServerConfig;
use crate::config::web_server::WebServerConfig;
use crate::handler::config_handler::{
    get_app_config_handler, get_config_handler, get_server_config_handler,
    get_web_server_config_handler, set_app_config_handler, set_server_config_handler,
    set_web_server_config_handler,
};
use actix_web::web::{get, post, resource, scope, Data};
use actix_web::{guard, web, Responder};
use std::sync::{Arc, RwLock};

async fn get_config(config: Data<Arc<RwLock<Config>>>) -> impl Responder {
    get_config_handler(config).await
}

async fn get_server_config(config: Data<Arc<RwLock<Config>>>) -> impl Responder {
    get_server_config_handler(config).await
}

async fn set_server_config(
    config: Data<Arc<RwLock<Config>>>,
    server_config: web::Json<ServerConfig>,
) -> impl Responder {
    set_server_config_handler(config, server_config).await
}

async fn get_app_config(config: Data<Arc<RwLock<Config>>>) -> impl Responder {
    get_app_config_handler(config).await
}

async fn set_app_config(
    config: Data<Arc<RwLock<Config>>>,
    app_config: web::Json<AppConfig>,
) -> impl Responder {
    set_app_config_handler(config, app_config).await
}

async fn get_web_server_config(config: Data<Arc<RwLock<Config>>>) -> impl Responder {
    get_web_server_config_handler(config).await
}

async fn set_web_server_config(
    config: Data<Arc<RwLock<Config>>>,
    web_server_config: web::Json<WebServerConfig>,
) -> impl Responder {
    set_web_server_config_handler(config, web_server_config).await
}

pub fn local_services(cfg: &mut web::ServiceConfig, host: &str) {
    cfg.service(
        scope("/local")
            .guard(
                guard::Any(guard::Host("localhost"))
                    .or(guard::Host("127.0.0.1"))
                    .or(guard::Host("[::1]"))
                    .or(guard::Host(host)),
            )
            .service(
                scope("/config")
                    .service(resource("").route(get().to(get_config)))
                    .service(
                        resource("/server")
                            .route(get().to(get_server_config))
                            .route(post().to(set_server_config)),
                    )
                    .service(
                        resource("/app")
                            .route(get().to(get_app_config))
                            .route(post().to(set_app_config)),
                    )
                    .service(
                        resource("/web_server")
                            .route(get().to(get_web_server_config))
                            .route(post().to(set_web_server_config)),
                    ),
            ),
    );
}
