mod constant;
mod vo;

use dotenvy::dotenv;
use std::env;

use crate::constant::default_value::DEFAULT_PORT;
use crate::constant::env::PORT;
use crate::vo::record::Record;
use actix_web::http::StatusCode;
use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use log::info;
use mongodb::{Client, Collection};

#[post("/record")]
async fn recorder(
    req: HttpRequest,
    record: web::Json<Record>,
    collection: web::Data<Collection<Record>>,
) -> impl Responder {
    let auth_header = match req.headers().get("Authorization") {
        Some(val) => match val.to_str() {
            Ok(v) => v,
            Err(_) => return HttpResponse::build(StatusCode::UNAUTHORIZED).finish(),
        },
        None => return HttpResponse::build(StatusCode::UNAUTHORIZED).finish(),
    };

    let token = match auth_header.split_whitespace().nth(1) {
        Some(v) => v,
        None => return HttpResponse::build(StatusCode::UNAUTHORIZED).finish(),
    };

    info!("token: {}", token);

    // info!("recorder: {:?}", fusion);
    let record = record.into_inner();

    let fusion_bytes = serde_json::to_vec(&record).unwrap();
    let size_kb = fusion_bytes.len() as f32 / 1024.0;
    info!("Received data size: {} KB", size_kb);

    collection.insert_one(record, None).await.unwrap();

    HttpResponse::Ok().into()
}

#[get("/version")]
async fn version() -> impl Responder {
    info!("version");
    HttpResponse::Ok()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let port: u16 = env::var(PORT)
        .map(|v| v.parse().unwrap_or(DEFAULT_PORT))
        .unwrap_or(DEFAULT_PORT);

    let uri = env::var("MONGODB_URI").expect("MONGODB_URI must be set");

    let client = Client::with_uri_str(uri).await.unwrap();
    let database = client.database("serverbee");
    let record_collection: Collection<Record> = database.collection("record");

    info!("listening on port {}", port);
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(record_collection.clone()))
            .service(recorder)
            .service(version)
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
