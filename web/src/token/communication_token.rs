use actix_web::web::Data;
use actix_web::{dev::Payload, FromRequest, HttpRequest};
use log::warn;
use serde::{Deserialize, Serialize};
use sled::Db;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct CommunicationToken(String);

impl CommunicationToken {
    pub fn is_valid(&self, db: &Data<Db>) -> bool {
        return if let Some(value) = db.get(CommunicationToken::token_key()).unwrap() {
            let res = std::str::from_utf8(&value);
            if let Ok(res) = res {
                return res == self.0;
            }
            false
        } else {
            db.insert(CommunicationToken::token_key(), self.0.as_bytes())
                .unwrap();
            true
        };
    }

    pub fn token_key() -> &'static str {
        "communication_token"
    }
}

impl FromRequest for CommunicationToken {
    type Error = actix_web::Error;
    type Future = futures_util::future::Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        let db = req.app_data::<Data<Db>>().unwrap();

        let query_string = req.query_string();
        let params: HashMap<String, String> =
            serde_urlencoded::from_str(query_string).unwrap_or_else(|_| HashMap::new());

        // Get token from Authorization header or from url query string
        let token_from_param = params
            .get("token")
            .map(|value| value.to_owned())
            .unwrap_or_default();

        let token_str = req
            .headers()
            .get("Authorization")
            .map(|value| value.to_str().unwrap_or_default().to_owned())
            .unwrap_or(token_from_param);

        if token_str.is_empty() {
            // If the token is not set, allow all requests
            if !db.contains_key(CommunicationToken::token_key()).unwrap() {
                return futures_util::future::ready(Ok(CommunicationToken("".to_owned())));
            }
            warn!(
                "Token is missing, request from: {}",
                req.connection_info()
                    .realip_remote_addr()
                    .unwrap_or("unknown")
            );
            futures_util::future::ready(Err(actix_web::error::ErrorUnauthorized(
                "Token is missing",
            )))
        } else {
            let token = CommunicationToken(token_str.clone());
            if token.is_valid(db) {
                futures_util::future::ready(Ok(token))
            } else {
                warn!(
                    "Token: {} is invalid, request from: {}",
                    token_str,
                    req.connection_info()
                        .realip_remote_addr()
                        .unwrap_or("unknown")
                );
                futures_util::future::ready(Err(actix_web::error::ErrorUnauthorized(
                    "Token is invalid",
                )))
            }
        }
    }
}
