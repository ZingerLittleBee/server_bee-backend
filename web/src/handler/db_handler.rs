use actix_web::{HttpResponse, web};
use sled::Db;
use crate::token::communication_token::CommunicationToken;

pub async fn db_test(_token: CommunicationToken, sled_db: web::Data<Db>) -> HttpResponse {
    sled_db.insert(b"key", b"value").unwrap();

    if let Some(value) = sled_db.get(b"key").unwrap() {
        HttpResponse::Ok().body(format!("value = {:?}", std::str::from_utf8(&value).unwrap()))
    } else {
        HttpResponse::NotFound().finish()
    }
}
