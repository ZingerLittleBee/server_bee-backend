#![cfg_attr(feature = "subsystem", windows_subsystem = "windows")]

use std::net::TcpListener;
use cli::Args;
use std::sync::{Arc, RwLock};

use crate::config::config::Config;
use crate::handler::http_handler::{check_token, kill_process, rest_token, version};

use crate::report::reporter::Reporter;
use crate::route::config_route::config_services;
use crate::route::local_route::local_services;
use crate::route::page_route::page_services;
use crate::route::pty_route::pty_service;
use crate::server::echo_ws;
use actix_web::{middleware, web, App, HttpServer};
use clap::Parser;
use log::info;

mod cli;
mod config;
mod db;
mod handler;
mod model;

mod pty;
mod report;
mod route;
mod server;
mod system_info;
mod test;
mod token;
mod traits;
mod utils;
mod vo;

fn is_ipv6_supported() -> bool {
    TcpListener::bind("[::]:0").is_ok()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    if is_ipv6_supported() {
        println!("IPv6 is supported");
    } else {
        println!("IPv6 is not supported");
    }

    let args = Args::parse();

    let config = Config::new(args);

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
            .configure(|cfg| local_services(cfg, &host))
            .configure(pty_service)
            .service(web::resource("/version").to(version))
            .service(web::resource("/check").to(check_token))
            .service(kill_process)
            .service(rest_token)
            // websocket route
            .service(web::resource("/ws").route(web::get().to(echo_ws)))
            .configure(page_services)
            // enable logger
            .wrap(middleware::Logger::default())
    })
    .workers(2)
    .bind(("0.0.0.0", port))?
    .bind(format!("[::]:{}", port))?
    .run()
    .await
}
