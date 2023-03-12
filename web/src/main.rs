#![cfg_attr(feature = "subsystem", windows_subsystem = "windows")]

use cli::Args;
use crate::config::Config;

use actix_web::{middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer, guard};
use actix_web_actors::ws;
use clap::Parser;
use log::info;
use sled::Db;
use crate::handler::http_handler::{clear_token, index, kill_process, rest_token, version, view_token};
use crate::handler::db_handler::db_test;
use crate::token::communication_token::CommunicationToken;

mod cli;
mod config;
mod model;
mod server;
mod system_info;
mod vo;
mod handler;
mod token;

use self::server::MyWebSocket;

/// WebSocket handshake and start `MyWebSocket` actor.
async fn echo_ws(_token: CommunicationToken, req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    ws::start(MyWebSocket::new(), &req, stream)
}

async fn init_sled_db() -> Db {
    sled::open("db").unwrap()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    let args = Args::parse();

    Config::init_logging(args.log_path);

    let port =
        args.port.unwrap_or_else(Config::get_server_port);

    info!("starting HTTP server at http://localhost:{}", port);

    let db = init_sled_db().await;

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(db.clone()))
            .app_data(web::JsonConfig::default().limit(4096))
            .service(web::resource("/").to(index))
            .service(web::resource("/version").to(version))
            .service(web::resource("/db").to(db_test))
            .service(kill_process)
            .service(rest_token)
            // websocket route
            .service(web::resource("/ws").route(web::get().to(echo_ws)))
            .service(
                web::scope("/token")
                    // private api localhost only
                    .guard(guard::Host("localhost"))
                    .service(web::resource("/view").to(view_token))
                    .service(web::resource("/clear").to(clear_token))
            )
            // enable logger
            .wrap(middleware::Logger::default())
    })
    .workers(2)
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
