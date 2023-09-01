use crate::handler::client_handler::{
    set_client_config, set_client_token, view_client_config, view_client_token,
};
use crate::handler::config_handler::{get_config, get_server_config};
use actix_web::web;

pub fn config_services(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/config")
            .service(web::resource("").route(web::get().to(get_config)))
            .service(
                web::scope("/server")
                    .service(web::resource("").route(web::get().to(get_server_config)))
                    .service(web::resource("/token/view").route(web::get().to(view_client_token)))
                    .service(web::resource("/token/rest").to(set_client_token)),
            )
            .service(
                web::scope("/app").service(
                    web::resource("/view")
                        .route(web::get().to(view_client_config))
                        .route(web::post().to(set_client_config)),
                ),
            ),
    );
}
