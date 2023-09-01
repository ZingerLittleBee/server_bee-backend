use crate::handler::config_handler::{
    get_app_config, get_config, get_server_config, get_web_server_config,
};
use actix_web::web;

pub fn config_services(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/config")
            .service(web::resource("").route(web::get().to(get_config)))
            .service(
                web::scope("/server")
                    .service(web::resource("").route(web::get().to(get_server_config))),
            )
            .service(
                web::scope("/app").service(web::resource("").route(web::get().to(get_app_config))),
            )
            .service(
                web::scope("/webserver")
                    .service(web::resource("").route(web::get().to(get_web_server_config))),
            ),
    );
}
