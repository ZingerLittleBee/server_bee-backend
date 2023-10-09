use crate::config::config::Config;
use actix_web::web::Data;
use actix_web::{dev::Payload, FromRequest, HttpRequest};
use log::warn;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

#[derive(Debug, Serialize, Deserialize)]
pub struct CommunicationToken(String);

impl CommunicationToken {
    pub fn is_valid(&self, config: &Data<Arc<RwLock<Config>>>) -> bool {
        let token = match config.read() {
            Ok(guard) => guard.app_token(),
            Err(e) => {
                warn!("Failed to acquire config read lock: {:?}", e);
                return false;
            }
        };

        if token.is_none() || token.clone().unwrap().is_empty() {
            if !self.0.is_empty() {
                match config.write() {
                    Ok(mut guard) => {
                        let _ = guard.set_app_token(Some(self.0.clone()));
                    }
                    Err(e) => {
                        warn!("Failed to acquire config write lock: {:?}", e);
                    }
                }
            }
            return true;
        }

        self.0 == token.unwrap()
    }
}

impl FromRequest for CommunicationToken {
    type Error = actix_web::Error;
    type Future = futures_util::future::Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        let config = match req.app_data::<Data<Arc<RwLock<Config>>>>() {
            Some(config) => config,
            None => {
                warn!("Failed to get config");
                return futures_util::future::ready(Err(
                    actix_web::error::ErrorInternalServerError("Failed to get config"),
                ));
            }
        };

        // Get token from url query string
        let params: HashMap<String, String> =
            serde_urlencoded::from_str(req.query_string()).unwrap_or_else(|_| HashMap::new());
        let token_from_param = params
            .get("token")
            .map(|value| value.to_owned())
            .unwrap_or_default();

        // Get token from Authorization header
        let token_from_header = req
            .headers()
            .get("Authorization")
            .map(|value| value.to_str().unwrap_or_default().to_owned())
            .unwrap_or_default();

        return if CommunicationToken(token_from_param.clone()).is_valid(config)
            || CommunicationToken(token_from_header.clone()).is_valid(config)
        {
            futures_util::future::ready(Ok(CommunicationToken(token_from_param)))
        } else {
            warn!(
                "Token: {} is invalid, request from: {}",
                token_from_param,
                req.connection_info()
                    .realip_remote_addr()
                    .unwrap_or("unknown")
            );
            futures_util::future::ready(Err(actix_web::error::ErrorUnauthorized(
                "Token is invalid",
            )))
        };
    }
}
