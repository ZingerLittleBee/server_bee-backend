#![cfg_attr(feature = "subsystem", windows_subsystem = "windows")]

use cli::Args;
use std::net::TcpListener;
use std::sync::{Arc, RwLock};

use crate::config::config::Config;
use crate::handler::http_handler::{check_token, kill_process, rest_token, version};

use crate::record::recorder::Recorder;
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
mod record;
mod route;
mod server;
mod system_info;
mod test;
mod token;
mod traits;
mod utils;
mod vo;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let args = Args::parse();

    let config = Config::new(args);

    let host = config.server_url().unwrap_or_else(|| String::from(""));

    let port = config.server_port();

    let config = Arc::new(RwLock::new(config));

    let report_config = Arc::clone(&config);

    actix_rt::spawn(async {
        Recorder::run(report_config).await;
    });

    let is_dual_stack = is_ipv6_supported();

    let bind_addr = if is_dual_stack {
        format!("[::]:{}", port)
    } else {
        format!("0.0.0.0:{}", port)
    };

    if is_dual_stack {
        info!("dual stack is supported");
        info!("starting HTTP server at IPv4 http://localhost:{}", port);
        info!("starting HTTP server at IPv6 http://[::1]:{}", port);
    } else {
        info!("System doesn't support dual stack");
        info!("starting HTTP server at http://localhost:{}", port);
    }

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
    .bind(bind_addr)?
    .run()
    .await
}

fn is_ipv6_supported() -> bool {
    TcpListener::bind("[::]:0").is_ok()
}
