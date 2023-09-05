use crate::config::config::Config;
use crate::handler::result::HttpResult;
use crate::token::communication_token::CommunicationToken;
use crate::traits::json_response::JsonResponse;
use actix_web::{post, web, HttpResponse, Responder};
use log::warn;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, RwLock};
use sysinfo::{Pid, ProcessExt, System, SystemExt};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct KilledInfo {
    pid: String,
}

pub async fn version() -> impl Responder {
    env!("CARGO_PKG_VERSION")
}

#[post("/kill")]
pub async fn kill_process(
    _token: CommunicationToken,
    info: web::Json<KilledInfo>,
) -> impl Responder {
    let pid: Pid = info.pid.parse().unwrap();
    let mut sys = System::new();
    let refresh_res = sys.refresh_process(pid);
    if refresh_res {
        if let Some(process) = sys.process(pid) {
            return JsonResponse(HttpResult::<()>::new(process.kill()));
        }
        JsonResponse(HttpResult::new(false))
    } else {
        JsonResponse(HttpResult::new_msg(false, "进程不存在".into()))
    }
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct TokenInfo {
    pub token: String,
}

#[post("/token/rest")]
pub async fn rest_token(
    _token: CommunicationToken,
    config: web::Data<Arc<RwLock<Config>>>,
    info: web::Json<TokenInfo>,
) -> impl Responder {
    rest_token_local(config, info).await
}

pub async fn check_token(_token: CommunicationToken) -> impl Responder {
    HttpResponse::Ok().finish()
}

/// private api localhost only
// /local/token/view
pub async fn view_token(config: web::Data<Arc<RwLock<Config>>>) -> impl Responder {
    warn!("Local Event: view_token");
    return match config.read() {
        Ok(guard) => {
            let token = guard.app_token();
            token.unwrap_or_default()
        }
        Err(e) => {
            warn!("Failed to acquire config read lock: {:?}", e);
            "".into()
        }
    };
}

// /local/token/clear
pub async fn clear_token(config: web::Data<Arc<RwLock<Config>>>) -> impl Responder {
    warn!("Local Event: clear_token");

    let res = match config.write() {
        Ok(mut guard) => guard.set_app_token(None),
        Err(e) => {
            warn!("Failed to acquire config write lock: {:?}", e);
            Err(anyhow::anyhow!(
                "Failed to acquire config write lock: {:?}",
                e
            ))
        }
    };
    JsonResponse(HttpResult::<()>::new(res.is_ok()))
}

// /local/token/rest
pub async fn rest_token_local(
    config: web::Data<Arc<RwLock<Config>>>,
    info: web::Json<TokenInfo>,
) -> impl Responder {
    warn!("Local Event: rest_token");

    let res = match config.write() {
        Ok(mut guard) => guard.set_app_token(Some(info.token.clone())),
        Err(e) => {
            warn!("Failed to acquire config write lock: {:?}", e);
            Err(anyhow::anyhow!(
                "Failed to acquire config write lock: {:?}",
                e
            ))
        }
    };
    JsonResponse(HttpResult::<()>::new(res.is_ok()))
}
