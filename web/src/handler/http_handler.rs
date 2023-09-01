use crate::handler::result::HttpResult;
use crate::token::communication_token::CommunicationToken;
use crate::traits::json_response::JsonResponse;
use actix_web::{post, web, HttpResponse, Responder};
use log::warn;
use serde::{Deserialize, Serialize};
use sled::Db;
use sysinfo::{Pid, ProcessExt, System, SystemExt};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct KilledInfo {
    pid: String,
}

/// To check service state
pub async fn index() -> impl Responder {
    HttpResponse::Ok()
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
    db: web::Data<Db>,
    info: web::Json<TokenInfo>,
) -> impl Responder {
    db.insert(CommunicationToken::token_key(), info.token.as_bytes())
        .unwrap();
    JsonResponse(HttpResult::<()>::new(true))
}

pub async fn check_token(_token: CommunicationToken) -> impl Responder {
    HttpResponse::Ok().finish()
}

/// private api localhost only
// /local/token/view
pub async fn view_token(db: web::Data<Db>) -> impl Responder {
    warn!("Local Event: view_token");
    if let Some(value) = db.get(CommunicationToken::token_key()).unwrap() {
        std::str::from_utf8(&value).unwrap_or_default().to_owned()
    } else {
        "".into()
    }
}

// /local/token/clear
pub async fn clear_token(db: web::Data<Db>) -> impl Responder {
    warn!("Local Event: clear_token");
    db.remove(CommunicationToken::token_key()).unwrap();
    JsonResponse(HttpResult::<()>::new(true))
}

// /local/token/rest
pub async fn rest_token_local(db: web::Data<Db>, info: web::Json<TokenInfo>) -> impl Responder {
    warn!("Local Event: rest_token");
    db.insert(CommunicationToken::token_key(), info.token.as_bytes())
        .unwrap();
    JsonResponse(HttpResult::<()>::new(true))
}
