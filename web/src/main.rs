#![cfg_attr(feature = "subsystem", windows_subsystem = "windows")]

use cli::Args;
use crate::config::Config;

use actix_web::{middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer, Responder};
use actix_web_actors::ws;
use clap::Parser;
use log::info;

mod cli;
mod config;
mod model;
mod server;
mod system_info;
mod vo;

use self::server::MyWebSocket;

/// To check service state
async fn index() -> impl Responder {
    HttpResponse::Ok()
}

async fn version() -> impl Responder {
    env!("CARGO_PKG_VERSION")
}

/// WebSocket handshake and start `MyWebSocket` actor.
async fn echo_ws(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    ws::start(MyWebSocket::new(), &req, stream)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    let args = Args::parse();

    Config::init_logging(args.log_path);

    let port =
        args.port.unwrap_or_else(Config::get_server_port);

    info!("starting HTTP server at http://localhost:{}", port);

    HttpServer::new(|| {
        App::new()
            .service(web::resource("/").to(index))
            .service(web::resource("/version").to(version))
            // websocket route
            .service(web::resource("/ws").route(web::get().to(echo_ws)))
            // enable logger
            .wrap(middleware::Logger::default())
    })
    .workers(2)
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
