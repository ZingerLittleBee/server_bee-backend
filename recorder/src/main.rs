mod constant;
mod mongo_helper;
mod vo;

use dotenvy::dotenv;
use std::collections::HashSet;
use std::env;

use crate::constant::default_value::DEFAULT_PORT;
use crate::constant::env::{MONGODB_URI, PORT, SERVER_JWT_SECRET};
use crate::mongo_helper::DbConnector;
use crate::vo::record::Record;
use actix_web::http::StatusCode;
use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use jsonwebtoken::{decode, DecodingKey, Validation};
use log::{debug, error, info, warn};
use mongodb::bson::doc;
use mongodb::{bson, Collection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    #[serde(rename = "userId")]
    user_id: String,

    #[serde(rename = "serverId")]
    server_id: String,
}

#[post("/record")]
async fn recorder(
    req: HttpRequest,
    record: web::Json<Record>,
    collection: web::Data<Collection<Record>>,
    invalid_collection: web::Data<Collection<bson::Document>>,
    secret: web::Data<String>,
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

    // if token in invalid_collection
    // return 403
    match invalid_collection
        .find_one(
            doc! {
                "token": token
            },
            None,
        )
        .await
    {
        Ok(Some(_)) => {
            info!("token: {} is invalid", token);
            return HttpResponse::build(StatusCode::FORBIDDEN).finish();
        }
        Ok(None) => {}
        Err(e) => {
            info!("find_one error: {}", e);
            return HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR).finish();
        }
    }

    debug!("token: {}", token);

    let mut validation = Validation::default();
    validation.validate_exp = false;
    validation.required_spec_claims = HashSet::new();

    let token_data = match decode::<Claims>(
        &token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    ) {
        Ok(data) => data,
        Err(e) => {
            warn!("jwt decode error: {}", e);
            return HttpResponse::build(StatusCode::UNAUTHORIZED).finish();
        }
    };

    let server_id = token_data.claims.server_id;

    debug!("server_id: {}", server_id);

    let mut record = record.into_inner();
    record.set_server_id(server_id);

    // let fusion_bytes = serde_json::to_vec(&record).unwrap();
    // let size_kb = fusion_bytes.len() as f32 / 1024.0;
    // info!("Received data size: {} KB", size_kb);

    collection.insert_one(record, None).await.unwrap();

    HttpResponse::Ok().into()
}

#[get("/version")]
async fn version() -> impl Responder {
    env!("CARGO_PKG_VERSION")
}

pub async fn run_server(
    port: u16,
    server_jwt_secret: String,
    record_collection: Collection<Record>,
    invalid_collection: Collection<bson::Document>,
) -> std::io::Result<()> {
    info!("listening on port {}", port);
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(server_jwt_secret.clone()))
            .app_data(web::Data::new(record_collection.clone()))
            .app_data(web::Data::new(invalid_collection.clone()))
            .service(recorder)
            .service(version)
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let port: u16 = env::var(PORT)
        .map(|v| v.parse().unwrap_or(DEFAULT_PORT))
        .unwrap_or(DEFAULT_PORT);

    let uri = env::var(MONGODB_URI).expect("MONGODB_URI must be set");

    let server_jwt_secret = env::var(SERVER_JWT_SECRET).expect("SERVER_JWT_SECRET must be set");

    match DbConnector::connect(uri.clone()).await {
        Ok(connector) => {
            info!("Connected to mongodb: {}", uri);
            let record_collection = connector.record_collection;
            let invalid_collection = connector.invalid_collection;
            run_server(
                port,
                server_jwt_secret,
                record_collection,
                invalid_collection,
            )
            .await
        }
        Err(e) => {
            error!("Failed to connect to mongodb: {}", e);
            Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Failed to connect to mongodb",
            ))
        }
    }
}
