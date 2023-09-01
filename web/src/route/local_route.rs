use crate::handler::client_handler::{
    set_client_config, set_client_token, view_client_config, view_client_token,
};
use actix_web::{guard, web};

pub fn local_services(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/local")
            .guard(guard::Any(guard::Host("localhost")).or(guard::Host("127.0.0.1")))
            .service(web::resource("/token/view").route(web::get().to(view_client_token)))
            .service(web::resource("/token/rest").to(set_client_token))
            .service(
                web::resource("/config")
                    .route(web::get().to(view_client_config))
                    .route(web::post().to(set_client_config)),
            ),
    );
}
