use crate::config::config::Config;
use crate::pty::pty_manager::{PtyManager, PtyMessage};
use crate::pty::shell_type::{ShellType, ShellTypeExt};
use crate::utils::common_util::get_terminal_time_format;
use crate::utils::pty_util::{makeword, MAGIC_FLAG};
use actix::{Actor, AsyncContext, StreamHandler};
use actix_web::{web, Error, HttpRequest, HttpResponse};
use actix_web_actors::ws;
use log::{debug, error, warn};
use std::collections::HashMap;
use std::str::from_utf8;
use std::sync::{Arc, Mutex, RwLock};

struct PtyWs {
    pty_manager: Arc<Mutex<PtyManager>>,
    config: Arc<RwLock<Config>>,
}

impl PtyWs {
    pub fn new(shell_type: ShellType, config: Arc<RwLock<Config>>) -> Self {
        Self {
            pty_manager: Arc::new(Mutex::new(PtyManager::new(shell_type))),
            config,
        }
    }
}

impl actix::Handler<PtyMessage> for PtyWs {
    type Result = ();

    fn handle(&mut self, msg: PtyMessage, ctx: &mut Self::Context) -> Self::Result {
        match msg {
            PtyMessage::Buffer(data) => {
                ctx.binary(data);
            }
        }
    }
}

impl Actor for PtyWs {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        let last_login = match self.config.try_read() {
            Ok(config) => get_terminal_time_format(config.last_login()),
            Err(_) => "Unknown".to_string(),
        };

        match self.config.try_write() {
            Ok(mut config) => match config.set_last_login_now() {
                Ok(_) => {}
                Err(e) => {
                    error!("Error setting last login: {}", e);
                }
            },
            Err(e) => {
                error!("Error getting config lock: {}", e);
            }
        }

        ctx.text(format!("Last login: {}\r\n", last_login));
        ctx.text("  _____                            ____\r\n");
        ctx.text(" / ____|                          |  _ \\\r\n");
        ctx.text("| (___   ___ _ ____   _____ _ __  | |_) | ___  ___\r\n");
        ctx.text(" \\___ \\ / _ \\ '__\\ \\ / / _ \\ '__| |  _ < / _ \\/ _ \\\r\n");
        ctx.text(" ____) |  __/ |   \\ V /  __/ |    | |_) |  __/  __/\r\n");
        ctx.text("|_____/ \\___|_|    \\_/ \\___|_|    |____/ \\___|\\___|\r\n");
        ctx.text(format!("Version: {}\r\n", env!("CARGO_PKG_VERSION")));
        ctx.text("\r\n");
        ctx.text("Website: https://serverbee.app\r\n");
        ctx.text("Documentation: https://docs.serverbee.app\r\n");
        ctx.text("\r\n");

        let rx = self.pty_manager.lock().unwrap().start();

        let addr = ctx.address();

        std::thread::spawn(move || loop {
            match rx.recv() {
                Ok(msg) => {
                    addr.do_send(msg);
                }
                Err(e) => {
                    println!("recv error: {}", e);
                }
            }
        });
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for PtyWs {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Text(text)) => {
                self.pty_manager
                    .lock()
                    .unwrap()
                    .write_to_pty(&text)
                    .unwrap();
            }
            Ok(ws::Message::Binary(bin)) => {
                let bin = bin.to_vec();

                if bin.len() == 6 && bin[0] == MAGIC_FLAG[0] && bin[1] == MAGIC_FLAG[1] {
                    let rows = makeword(bin[2], bin[3]);
                    let cols = makeword(bin[4], bin[5]);

                    debug!("set pty size rows:{:?} cols: {:?}", rows, cols);

                    match self.pty_manager.lock() {
                        Ok(pty_manager) => {
                            pty_manager.resize_pty(rows, cols);
                        }
                        Err(e) => {
                            error!("Error getting pty manager lock: {}", e)
                        }
                    }
                    return;
                }

                match self.pty_manager.lock() {
                    Ok(mut pty_manager) => {
                        if let Err(e) =
                            pty_manager.write_to_pty(from_utf8(&bin).unwrap_or_default())
                        {
                            error!("Error writing to pty: {}", e);
                        }
                    }
                    Err(e) => {
                        error!("Error getting pty manager lock: {}", e)
                    }
                }
            }
            Ok(ws::Message::Close(reason)) => {
                warn!("WebSocket connection is closing for reason: {:?}", reason);
            }
            _ => (),
        }
    }
}

async fn pty_index(
    req: HttpRequest,
    stream: web::Payload,
    config: web::Data<Arc<RwLock<Config>>>,
) -> Result<HttpResponse, Error> {
    let params: HashMap<String, String> =
        serde_urlencoded::from_str(req.query_string()).unwrap_or_else(|_| HashMap::new());
    let shell = params
        .get("shell")
        .map(|value| value.to_shell_type())
        .unwrap_or(ShellType::default());
    let resp = ws::start(PtyWs::new(shell, config.as_ref().clone()), &req, stream);
    resp
}

pub fn pty_service(cfg: &mut web::ServiceConfig) {
    cfg.service(web::resource("/pty").route(web::get().to(pty_index)));
}
