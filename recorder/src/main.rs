mod constant;
mod vo;

use dotenvy::dotenv;
use std::collections::HashSet;
use std::env;

use crate::constant::db::{
    DATABASE_NAME, INVALID_COLLECTION_INDEX, INVALID_COLLECTION_NAME, RECORD_COLLECTION_NAME,
};
use crate::constant::default_value::DEFAULT_PORT;
use crate::constant::env::{MONGODB_URI, PORT, SERVER_JWT_SECRET};
use crate::vo::record::Record;
use actix_web::http::StatusCode;
use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use jsonwebtoken::{decode, DecodingKey, Validation};
use log::{debug, error, info, warn};
use mongodb::bson::doc;
use mongodb::options::IndexOptions;
use mongodb::{bson, Client, Collection, IndexModel};
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

    let uri = env::var(MONGODB_URI).expect("MONGODB_URI must be set");

    let server_jwt_secret = env::var(SERVER_JWT_SECRET).expect("SERVER_JWT_SECRET must be set");

    let client = Client::with_uri_str(uri).await.unwrap();
    let database = client.database(DATABASE_NAME);
    let record_collection: Collection<Record> = database.collection(RECORD_COLLECTION_NAME);
    let invalid_collection: Collection<bson::Document> =
        database.collection(INVALID_COLLECTION_NAME);

    let collection_names = if let Ok(collection_names) = database.list_collection_names(None).await
    {
        collection_names
    } else {
        vec![]
    };
    if !collection_names.contains(&INVALID_COLLECTION_NAME.to_string()) {
        let initial_document = doc! { INVALID_COLLECTION_INDEX: "test" };
        match database
            .collection(INVALID_COLLECTION_NAME)
            .insert_one(initial_document, None)
            .await
        {
            Ok(_) => {}
            Err(e) => {
                error!("failed to insert initial document: {:?}", e);
            }
        }

        let index_model = IndexModel::builder()
            .keys(doc! { INVALID_COLLECTION_INDEX: 1 })
            .options(
                IndexOptions::builder()
                    .name(Some(INVALID_COLLECTION_INDEX.to_string()))
                    .unique(true)
                    .build(),
            )
            .build();
        match invalid_collection.create_index(index_model, None).await {
            Ok(_) => {}
            Err(e) => {
                error!("failed to create index: {:?}", e);
            }
        }
    }

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
