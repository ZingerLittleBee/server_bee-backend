use actix_web::{HttpResponse, Responder, post, web, HttpRequest};
use actix_web::body::BoxBody;
use actix_web::http::header::ContentType;
use sysinfo::{Pid, ProcessExt, System, SystemExt};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
struct HttpResult {
    success: bool,

    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

impl HttpResult {
    fn new(success: bool) -> HttpResult {
        HttpResult {
            success,
            message: None,
        }
    }

    fn new_msg(success: bool, message: String) -> HttpResult {
        HttpResult {
            success,
            message: Some(message),
        }
    }
}

impl Responder for HttpResult {
    type Body = BoxBody;

    fn respond_to(self, _req: &HttpRequest) -> HttpResponse<Self::Body> {
        let body = serde_json::to_string(&self).unwrap();

        // Create response and set content type
        HttpResponse::Ok()
            .content_type(ContentType::json())
            .body(body)
    }
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct KilledInfo {
    pid: String
}

/// To check service state
pub async fn index() -> impl Responder {
    HttpResponse::Ok()
}

pub async fn version() -> impl Responder {
    env!("CARGO_PKG_VERSION")
}

#[post("/kill")]
pub async fn kill_process(info: web::Json<KilledInfo>) -> impl Responder {
    let pid: Pid = info.pid.parse().unwrap();
    let mut sys = System::new();
    let refresh_res = sys.refresh_process(pid);
    if refresh_res {
        if let Some(process) = sys.process(pid) {
            return HttpResult::new(process.kill());
        }
        HttpResult::new(false)
    } else {
        HttpResult::new_msg(false, "进程不存在".into())
    }
}
