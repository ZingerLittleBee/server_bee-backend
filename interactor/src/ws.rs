use actix::fut::wrap_future;
use std::sync::Arc;
use std::time::{Duration, Instant};

use crate::vo::record::Record;
use actix::prelude::*;
use actix_web::{web, Error, HttpRequest, HttpResponse};
use actix_web_actors::ws;
use anyhow::Result;
use bytestring::ByteString;
use futures_util::TryStreamExt;
use log::{error, warn};
use mongodb::bson::doc;
use mongodb::{bson, Collection};

/// How often heartbeat pings are sent
const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);

const TASK_INTERVAL: Duration = Duration::from_secs(1);

/// How long before lack of client response causes a timeout
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

#[derive(Debug, Clone)]
enum HubMessage {
    Overview,
    Detail(String),
    Process,
    ProcessDetail(String),
}

pub struct MyWebSocket {
    hb: Instant,
    collection: Arc<Collection<Record>>,
    message: HubMessage,
}

impl MyWebSocket {
    pub fn new(collection: Arc<Collection<Record>>) -> Self {
        Self {
            hb: Instant::now(),
            collection,
            message: HubMessage::Overview,
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

            let message = act.message.clone();

            match message {
                HubMessage::Overview => {
                    ctx.spawn(
                        wrap_future::<_, Self>(Self::overview(collection.clone())).map(
                            |result, _, ctx| match result {
                                Ok(records) => {
                                    let json_string = serde_json::to_string(&records)
                                        .expect("Failed to serialize records");
                                    ctx.text(ByteString::from(json_string));
                                }
                                Err(e) => {
                                    error!("failed to execute overview: {:?}", e);
                                }
                            },
                        ),
                    );
                }
                HubMessage::Detail(server_id) => {
                    ctx.spawn(
                        wrap_future::<_, Self>(Self::detail(collection.clone(), server_id.clone()))
                            .map(move |result, _, ctx| match result {
                                Some(record) => {
                                    let json_string = serde_json::to_string(&record)
                                        .expect("Failed to serialize record");
                                    ctx.text(ByteString::from(json_string));
                                }
                                None => {
                                    error!("failed to execute detail: {:?}", server_id);
                                }
                            }),
                    );
                }
                HubMessage::Process => {}
                HubMessage::ProcessDetail(_) => {}
            };
        });
    }

    async fn detail(collection: Arc<Collection<Record>>, server_id: String) -> Option<Record> {
        let find_options = mongodb::options::FindOneOptions::builder()
            .sort(doc! { "time": -1 })
            .build();
        match collection
            .find_one(
                {
                    doc! { "server_id": server_id }
                },
                find_options,
            )
            .await
        {
            Ok(Some(record)) => Some(record),
            Ok(None) => None,
            Err(e) => {
                error!("failed to execute find_one: {:?}", e);
                None
            }
        }
    }

    async fn overview(collection: Arc<Collection<Record>>) -> Result<Vec<Record>> {
        let pipeline = vec![
            doc! {
                "$group": {
                    "_id": "$server_id",
                    "overview": { "$first": "$fusion.overview" },
                    "server_id": { "$first": "$server_id" },
                    "time": { "$first": "$time" }
                }
            },
            doc! {
                "$sort": { "record.time": -1 }
            },
            doc! {
                "$project": {
                    "server_id": 1,
                    "fusion": {
                        "overview": "$overview"
                    },
                    "time": 1,
                    "_id": 0
                }
            },
        ];

        let mut cursor = collection.aggregate(pipeline, None).await?;
        let mut records = Vec::new();

        while let Some(result) = cursor.try_next().await? {
            let record: Record = bson::from_document(result)?;
            records.push(record);
        }
        Ok(records)
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
            Ok(ws::Message::Text(text)) => {
                let msg = text.trim();
                if msg.starts_with('/') {
                    let mut command = msg.splitn(2, ' ');

                    match command.next() {
                        Some("/overview") => self.message = HubMessage::Overview,
                        Some("/detail") => {
                            if let Some(cmd) = command.next() {
                                self.message = HubMessage::Detail(cmd.to_string());
                            }
                        }
                        Some("/process") => {
                            self.message = HubMessage::Process;
                        }
                        Some("/process_detail") => {
                            if let Some(cmd) = command.next() {
                                self.message = HubMessage::ProcessDetail(cmd.to_string());
                            }
                        }
                        _ => {}
                    }
                }
            }
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
