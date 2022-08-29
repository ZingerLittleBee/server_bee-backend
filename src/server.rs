use std::time::{Duration, Instant};

use crate::model::formator::{Convert, OverviewFormat};
use crate::system_info::SystemInfo;
use actix::prelude::*;
use actix_web_actors::ws;
use bytestring::ByteString;

/// How often heartbeat pings are sent
const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);

const OVERVIEW_INTERVAL: Duration = Duration::from_secs(1);

/// How long before lack of client response causes a timeout
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

pub struct MyWebSocket {
    hb: Instant,
    sys: SystemInfo,
}

impl MyWebSocket {
    pub fn new() -> Self {
        Self {
            hb: Instant::now(),
            sys: SystemInfo::new(),
        }
    }

    fn hb(&self, ctx: &mut <Self as Actor>::Context) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            // check client heartbeats
            if Instant::now().duration_since(act.hb) > CLIENT_TIMEOUT {
                // heartbeat timed out
                println!("Websocket Client heartbeat failed, disconnecting!");

                // stop actor
                ctx.stop();

                // don't try to send a ping
                return;
            }

            ctx.ping(b"");
        });
    }

    fn overview(&self, ctx: &mut <Self as Actor>::Context) {
        ctx.run_interval(OVERVIEW_INTERVAL, |act, ctx| {
            ctx.text(act.sys.get_overview().convert())
        });
    }
}

impl Actor for MyWebSocket {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        self.hb(ctx);
        self.overview(ctx);
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

                    if let Some("/more") = command.next() {
                        // let param = command.next();
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

impl From<OverviewFormat> for ByteString {
    fn from(overview: OverviewFormat) -> Self {
        serde_json::to_string(&overview).unwrap().into()
    }
}
