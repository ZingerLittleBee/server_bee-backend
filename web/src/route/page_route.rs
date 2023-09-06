use actix_web::{get, web, HttpResponse, Responder};
use mime_guess::from_path;
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "../view/out"]
struct Asset;

fn handle_embedded_file(path: &str) -> HttpResponse {
    match Asset::get(path) {
        Some(content) => HttpResponse::Ok()
            .content_type(from_path(path).first_or_octet_stream().as_ref())
            .body(content.data.into_owned()),
        None => handle_embedded_file("index.html"),
    }
}

#[get("/")]
async fn index() -> impl Responder {
    handle_embedded_file("index.html")
}

#[get("/settings")]
async fn settings() -> impl Responder {
    handle_embedded_file("settings.html")
}

#[get("/settings/{tail:.*}")]
async fn settings_tail(tail: web::Path<String>) -> impl Responder {
    handle_embedded_file(format!("settings/{}.html", tail.into_inner()).as_str())
}

// #[get("/{file:.*}")]
#[get("/_next/{file:.*}")]
async fn next_files(file: web::Path<String>) -> impl Responder {
    handle_embedded_file(format!("_next/{}", file.into_inner()).as_str())
}

#[get("/{name:.*}.ico")]
async fn ico(name: web::Path<String>) -> impl Responder {
    handle_embedded_file(format!("{}.ico", name.into_inner()).as_str())
}

#[get("/{name:.*}.txt")]
async fn txt(name: web::Path<String>) -> impl Responder {
    handle_embedded_file(format!("{}.txt", name.into_inner()).as_str())
}

pub fn page_services(cfg: &mut web::ServiceConfig) {
    cfg.service(index)
        .service(next_files)
        .service(ico)
        .service(txt)
        .service(settings)
        .service(settings_tail);
}
