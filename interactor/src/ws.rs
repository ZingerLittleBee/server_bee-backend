use actix::fut::wrap_future;
use std::sync::Arc;
use std::time::{Duration, Instant};

use crate::vo::record::Record;
use actix::prelude::*;
use actix_web::{web, Error, HttpRequest, HttpResponse};
use actix_web_actors::ws;
use log::{error, warn};
use mongodb::bson::doc;
use mongodb::Collection;

/// How often heartbeat pings are sent
const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);

const TASK_INTERVAL: Duration = Duration::from_secs(1);

/// How long before lack of client response causes a timeout
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

pub struct MyWebSocket {
    hb: Instant,
    collection: Arc<Collection<Record>>,
}

impl MyWebSocket {
    pub fn new(collection: Arc<Collection<Record>>) -> Self {
        Self {
            hb: Instant::now(),
            collection,
        }
    }

    fn hb(&self, ctx: &mut <Self as Actor>::Context) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            if Instant::now().duration_since(act.hb) > CLIENT_TIMEOUT {
                warn!("Websocket Client heartbeat failed, disconnecting!");
                ctx.stop();
                return;
            }

            ctx.ping(b"");
        });
    }

    fn task(&self, ctx: &mut <Self as Actor>::Context) {
        ctx.run_interval(TASK_INTERVAL, move |act, ctx| {
            let collection = act.collection.clone();

            let find_options = mongodb::options::FindOneOptions::builder()
                .sort(doc! { "time": -1 })
                .build();

            let fut = async move {
                match collection.find_one(None, find_options).await {
                    Ok(Some(record)) => Some(record),
                    Ok(None) => None,
                    Err(e) => {
                        error!("failed to execute find_one: {:?}", e);
                        None
                    }
                }
            };

            // 使用 wrap_future 将普通的 Future 转换为 ActorFuture
            let actor_fut = wrap_future::<_, Self>(fut).map(|result, act, ctx| match result {
                Some(record) => {
                    ctx.text(record.get_fusion());
                }
                None => {
                    ctx.text("No record found or there was an error.");
                }
            });
            ctx.spawn(actor_fut);
        });
    }
}

impl Actor for MyWebSocket {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        self.hb(ctx);
        self.task(ctx);
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWebSocket {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => {
                self.hb = Instant::now();
                ctx.pong(&msg);
            }
            Ok(ws::Message::Pong(_)) => {
                self.hb = Instant::now();
            }
            Ok(ws::Message::Text(text)) => {}
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin),
            Ok(ws::Message::Close(reason)) => {
                ctx.close(reason);
                ctx.stop();
            }
            _ => ctx.stop(),
        }
    }
}

pub async fn echo_ws(
    req: HttpRequest,
    stream: web::Payload,
    record_collection: web::Data<Collection<Record>>,
) -> Result<HttpResponse, Error> {
    ws::start(
        MyWebSocket::new(record_collection.into_inner()),
        &req,
        stream,
    )
}
