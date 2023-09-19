use actix_web::{get, web, HttpResponse, Responder};
use mime_guess::from_path;
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "../view/dist"]
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

#[get("/dashboard")]
async fn dashboard() -> impl Responder {
    handle_embedded_file("index.html")
}

#[get("/login")]
async fn login() -> impl Responder {
    handle_embedded_file("index.html")
}

#[get("/settings/{tail:.*}")]
async fn settings_tail() -> impl Responder {
    handle_embedded_file("index.html")
}

#[get("/{name:.*}.js")]
async fn js(name: web::Path<String>) -> impl Responder {
    handle_embedded_file(format!("{}.js", name.into_inner()).as_str())
}

#[get("/{name:.*}.css")]
async fn css(name: web::Path<String>) -> impl Responder {
    handle_embedded_file(format!("{}.css", name.into_inner()).as_str())
}

#[get("/{name:.*}.svg")]
async fn svg(name: web::Path<String>) -> impl Responder {
    handle_embedded_file(format!("{}.svg", name.into_inner()).as_str())
}

pub fn page_services(cfg: &mut web::ServiceConfig) {
    cfg.service(index)
        .service(login)
        .service(dashboard)
        .service(js)
        .service(css)
        .service(svg)
        .service(settings_tail);
}
