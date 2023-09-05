#![cfg_attr(feature = "subsystem", windows_subsystem = "windows")]

use cli::Args;
use std::sync::{Arc, RwLock};

use crate::config::config::Config;
use crate::handler::db_handler::db_test;
use crate::handler::http_handler::{
    check_token, clear_token, kill_process, rest_token, rest_token_local, version, view_token,
};

use crate::db::db_wrapper::DbWrapper;
use crate::report::reporter::Reporter;
use crate::route::config_route::config_services;
use crate::route::local_route::local_services;
use crate::server::echo_ws;
use actix_web::{guard, middleware, web, App, HttpResponse, HttpServer, Responder};
use clap::Parser;
use log::info;
use mime_guess::from_path;
use rust_embed::RustEmbed;

mod cli;
mod config;
mod db;
mod handler;
mod model;
mod report;
mod route;
mod server;
mod system_info;
mod token;
mod traits;
mod vo;

#[derive(RustEmbed)]
#[folder = "../view/out"]
struct Asset;

fn handle_embedded_file(path: &str) -> HttpResponse {
    match Asset::get(path) {
        Some(content) => HttpResponse::Ok()
            .content_type(from_path(path).first_or_octet_stream().as_ref())
            .body(content.data.into_owned()),
        None => HttpResponse::NotFound().body("404 Not Found"),
    }
}

#[actix_web::get("/")]
async fn index() -> impl Responder {
    handle_embedded_file("index.html")
}

#[actix_web::get("/{file:.*}")]
async fn files(file: web::Path<String>) -> impl Responder {
    handle_embedded_file(file.as_ref())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let args = Args::parse();

    // let db = init_sled_db();

    let db = DbWrapper::new();

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
            .app_data(web::Data::new(Arc::clone(&config)))
            .app_data(web::JsonConfig::default().limit(4096))
            .configure(config_services)
            .configure(local_services)
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
            .service(index)
            .service(files)
            // enable logger
            .wrap(middleware::Logger::default())
    })
    .workers(2)
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
