mod auth;
mod constant;
mod vo;
mod ws;

use crate::constant::db::{
    DATABASE_NAME, INVALID_COLLECTION_INDEX, INVALID_COLLECTION_NAME, RECORD_COLLECTION_NAME,
};
use crate::constant::default_value::DEFAULT_PORT;
use crate::constant::env::{AUTH_SERVER_URL, MONGODB_URI, PORT, SERVER_JWT_SECRET};
use crate::vo::record::Record;
use crate::ws::echo_ws;
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use dotenvy::dotenv;
use log::{error, info};
use mongodb::bson::doc;
use mongodb::options::IndexOptions;
use mongodb::{bson, Client, Collection, IndexModel};
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let uri = env::var(MONGODB_URI).expect("MONGODB_URI must be set");

    let server_jwt_secret = env::var(SERVER_JWT_SECRET).expect("SERVER_JWT_SECRET must be set");

    env::var(AUTH_SERVER_URL).expect("AUTH_SERVER_URL must be set");

    let client = Client::with_uri_str(uri).await.unwrap();
    let database = client.database(DATABASE_NAME);
    let record_collection: Collection<Record> = database.collection(RECORD_COLLECTION_NAME);
    let invalid_collection: Collection<bson::Document> =
        database.collection(INVALID_COLLECTION_NAME);

    let port: u16 = env::var(PORT)
        .map(|v| v.parse().unwrap_or(DEFAULT_PORT))
        .unwrap_or(DEFAULT_PORT);

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
            .service(web::resource("/health").route(web::get().to(|| HttpResponse::Ok())))
            .service(web::resource("/version").route(web::get().to(version)))
            .service(web::resource("/ws").route(web::get().to(echo_ws)))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}

pub async fn version() -> impl Responder {
    env!("CARGO_PKG_VERSION")
}
