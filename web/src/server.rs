use std::time::{Duration, Instant};

use crate::system_info::SystemInfo;
use crate::token::communication_token::CommunicationToken;
use actix::prelude::*;
use actix_web::{web, Error, HttpRequest, HttpResponse};
use actix_web_actors::ws;
use log::warn;

/// How often heartbeat pings are sent
const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);

const TASK_INTERVAL: Duration = Duration::from_secs(1);

/// How long before lack of client response causes a timeout
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

enum Signal {
    More,
    Less,
    Process,
}

#[derive(Copy, Clone, Debug)]
pub enum SortOrder {
    Up,
    Down,
}

#[derive(Copy, Clone, Debug)]
pub enum SortBy {
    Pid,
    Name,
    Cpu,
    Memory,
}

impl SortBy {
    fn from(s: &str) -> SortBy {
        match s {
            "pid" => SortBy::Pid,
            "name" => SortBy::Name,
            "cpu" => SortBy::Cpu,
            "mem" => SortBy::Memory,
            _ => {
                warn!("Unknown sort by: {}", s);
                SortBy::Pid
            }
        }
    }
}

#[derive(Copy, Clone, Debug)]
pub struct Sort {
    pub order: SortOrder,
    pub by: SortBy,
}

pub struct MyWebSocket {
    hb: Instant,
    sys: SystemInfo,
    signal: Signal,
    pid: Option<String>,
    sort: Option<Sort>,
}

impl MyWebSocket {
    pub fn new() -> Self {
        Self {
            hb: Instant::now(),
            sys: SystemInfo::new(),
            signal: Signal::Less,
            pid: None,
            sort: None,
        }
    }

    fn hb(&self, ctx: &mut <Self as Actor>::Context) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            // check client heartbeats
            if Instant::now().duration_since(act.hb) > CLIENT_TIMEOUT {
                // heartbeat timed out
                warn!("Websocket Client heartbeat failed, disconnecting!");

                // stop actor
                ctx.stop();

                // don't try to send a ping
                return;
            }

            ctx.ping(b"");
        });
    }

    fn task(&self, ctx: &mut <Self as Actor>::Context) {
        ctx.run_interval(TASK_INTERVAL, |act, ctx| {
            ctx.text(match act.signal {
                Signal::More => act.sys.get_full_fusion(),
                Signal::Less => act.sys.get_less_fusion(),
                Signal::Process => act.sys.get_process_fusion(act.pid.clone(), act.sort),
            })
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
            Ok(ws::Message::Text(text)) => {
                let msg = text.trim();
                if msg.starts_with('/') {
                    let mut command = msg.splitn(2, ' ');

                    match command.next() {
                        Some("/more") => self.signal = Signal::More,
                        Some("/less") => {
                            self.signal = Signal::Less;
                            // handle process
                            self.pid = None;
                            self.sort = None;
                        }
                        Some("/process") => {
                            let param = command.next();
                            self.signal = Signal::Process;
                            self.pid = param.map(|s| s.to_string());
                        }
                        Some("/close_detail") => {
                            self.pid = None;
                        }
                        Some("/up") => {
                            let param = command.next();
                            let sort = param.map(|sort_by| Sort {
                                order: SortOrder::Up,
                                by: SortBy::from(sort_by.to_lowercase().as_str()),
                            });
                            self.sort = sort;
                        }
                        Some("/down") => {
                            let param = command.next();
                            let sort = param.map(|sort_by| Sort {
                                order: SortOrder::Down,
                                by: SortBy::from(sort_by.to_lowercase().as_str()),
                            });
                            self.sort = sort;
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

/// WebSocket handshake and start `MyWebSocket` actor.
pub async fn echo_ws(
    _token: CommunicationToken,
    req: HttpRequest,
    stream: web::Payload,
) -> Result<HttpResponse, Error> {
    ws::start(MyWebSocket::new(), &req, stream)
}
