use crate::pty::pty_manager::{PtyManager, PtyMessage};
use crate::pty::shell_type::{ShellType, ShellTypeExt};
use crate::utils::pty_util::{makeword, MAGIC_FLAG};
use actix::fut::ActorFutureExt;
use actix::{Actor, AsyncContext, Running, StreamHandler, WrapFuture};
use actix_web::{web, Error, HttpRequest, HttpResponse};
use actix_web_actors::ws;
use log::{debug, error, warn};
use nix::libc;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

struct MyWs {
    pty_manager: Arc<Mutex<PtyManager>>,
}

impl MyWs {
    pub fn new(shell_type: ShellType) -> Self {
        let pty_manager = PtyManager::new(shell_type);
        let pty_manager = Arc::new(Mutex::new(pty_manager));

        Self { pty_manager }
    }
}

impl Actor for MyWs {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        match self.pty_manager.lock() {
            Ok(pty_manager) => ctx.binary(pty_manager.history()),
            Err(e) => {
                error!("Error getting pty_manager lock: {}", e);
            }
        }
    }

    fn stopping(&mut self, _ctx: &mut Self::Context) -> Running {
        warn!("WebSocket connection is stopping");
        Running::Stop
    }
}

impl StreamHandler<PtyMessage> for MyWs {
    fn handle(&mut self, msg: PtyMessage, ctx: &mut Self::Context) {
        match msg {
            PtyMessage::Buffer(data) => {
                ctx.binary(data);
            }
        }
    }
}

async fn write_all(pty_manager_lock: Arc<Mutex<PtyManager>>, data: Vec<u8>) {
    let data_ref = data.as_slice();
    match pty_manager_lock.lock() {
        Ok(mut pty_manager) => match pty_manager.write_all(data_ref).await {
            Ok(_) => {}
            Err(e) => {
                error!("Error writing to pty in: {}", e);
            }
        },
        Err(e) => {
            error!("Error getting pty manager lock: {}", e);
        }
    }
}

/// Handler for ws::Message message
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWs {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Text(text)) => {
                ctx.spawn(
                    write_all(self.pty_manager.clone(), text.as_bytes().to_vec()).into_actor(self),
                );
            }
            Ok(ws::Message::Binary(bin)) => {
                let bin = bin.to_vec();

                if bin.len() == 6 && bin[0] == MAGIC_FLAG[0] && bin[1] == MAGIC_FLAG[1] {
                    let size = Box::new(libc::winsize {
                        ws_row: makeword(bin[2], bin[3]),
                        ws_col: makeword(bin[4], bin[5]),
                        ws_xpixel: 0,
                        ws_ypixel: 0,
                    });

                    debug!("set pty size:{:?}", size);

                    match self.pty_manager.lock() {
                        Ok(pty_manager) => {
                            if pty_manager.set_termsize(size) {
                                // std::process::exit(0);
                                error!("set pty size failed")
                            }
                        }
                        Err(e) => {
                            error!("Error getting pty manager lock: {}", e)
                        }
                    }
                    return;
                }

                ctx.spawn(write_all(self.pty_manager.clone(), bin.to_vec()).into_actor(self));
            }
            Ok(ws::Message::Close(reason)) => {
                warn!("WebSocket connection is closing for reason: {:?}", reason);
            }
            _ => (),
        }
    }

    fn started(&mut self, ctx: &mut Self::Context) {
        // ctx.binary(self.history.clone());

        let pty_manager = self.pty_manager.clone();
        let fut = async move {
            let rx = match pty_manager.lock() {
                Ok(mut pty_manager) => pty_manager.start().await,
                Err(e) => {
                    eprintln!("Error getting pty_manager lock: {}", e);
                    panic!("Error getting pty_manager lock: {}", e);
                }
            };
            Ok(rx)
        };

        ctx.spawn(fut.into_actor(self).map(|res, _act, ctx| match res {
            Ok(mut rx) => {
                ctx.add_stream(async_stream::stream! {
                    while let Some(msg) = rx.recv().await {
                        yield msg;
                    }
                });
            }
            Err(()) => {
                error!("Error starting pty manager")
            }
        }));
    }
}

async fn index(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let params: HashMap<String, String> =
        serde_urlencoded::from_str(req.query_string()).unwrap_or_else(|_| HashMap::new());
    let shell = params
        .get("shell")
        .map(|value| value.to_shell_type())
        .unwrap_or(ShellType::Bash);
    let resp = ws::start(MyWs::new(shell), &req, stream);
    resp
}

pub fn pty_service(cfg: &mut web::ServiceConfig) {
    cfg.service(web::resource("/pty").route(web::get().to(index)));
}
