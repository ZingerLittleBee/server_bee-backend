#![cfg_attr(feature = "subsystem", windows_subsystem = "windows")]

use cli::Args;
use std::sync::{Arc, RwLock};

use crate::config::config::Config;
use crate::handler::db_handler::{config_test, db_test};
use crate::handler::http_handler::{
    check_token, clear_token, index, kill_process, rest_token, rest_token_local, version,
    view_token,
};

use crate::report::reporter::Reporter;
use crate::route::config_route::config_services;
use crate::route::local_route::local_services;
use crate::token::communication_token::CommunicationToken;
use actix_web::{guard, middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;
use clap::Parser;
use log::info;
use sled::Db;

mod cli;
mod config;
mod handler;
mod model;
mod report;
mod route;
mod server;
mod system_info;
mod token;
mod traits;
mod vo;

use self::server::MyWebSocket;

/// WebSocket handshake and start `MyWebSocket` actor.
async fn echo_ws(
    _token: CommunicationToken,
    req: HttpRequest,
    stream: web::Payload,
) -> Result<HttpResponse, Error> {
    ws::start(MyWebSocket::new(), &req, stream)
}

fn init_sled_db() -> Db {
    sled::open("db").unwrap()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let args = Args::parse();

    let db = init_sled_db();

    let config = Config::new(db.clone(), args);

    let host = config.server_host().unwrap_or_else(|| String::from(""));

    let port = config.server_port();

    info!("starting HTTP server at http://localhost:{}", port);

    let config = Arc::new(RwLock::new(config));

    let report_config = Arc::clone(&config);

    actix_rt::spawn(async {
        Reporter::run(report_config).await;
    });

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(db.clone()))
            .app_data(web::Data::new(Arc::clone(&config)))
            .app_data(web::JsonConfig::default().limit(4096))
            .configure(config_services)
            .configure(local_services)
            .service(web::resource("/").to(index))
            .service(web::resource("/version").to(version))
            .service(web::resource("/db").to(db_test))
            // .service(web::resource("/config").to(config_test))
            .service(web::resource("/check").route(web::post().to(check_token)))
            .service(kill_process)
            .service(rest_token)
            // websocket route
            .service(web::resource("/ws").route(web::get().to(echo_ws)))
            .service(
                web::scope("/local")
                    // private api localhost only
                    .guard(guard::Any(guard::Host("localhost")).or(guard::Host("127.0.0.1")))
                    .service(web::resource("/token/view").to(view_token))
                    .service(web::resource("/token/clear").to(clear_token))
                    .service(web::resource("/token/rest").to(rest_token_local)),
            )
            // enable logger
            .wrap(middleware::Logger::default())
    })
    .workers(2)
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
