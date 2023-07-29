use crate::cli::Args;
use anyhow::Result;
use log::{info, LevelFilter};
use log4rs::append::console::ConsoleAppender;
use log4rs::append::file::FileAppender;
use log4rs::config::{Appender, Root};
use log4rs::encode::pattern::PatternEncoder;
use serde::{Deserialize, Serialize};
use sled::Db;
use std::env;
use std::fs::File;
use std::path::PathBuf;

const LOG_PATH: &str = "log_path";
const PORT: &str = "port";
const TOKEN: &str = "token";
const SERVER_HOST: &str = "server_host";

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone, Copy)]
struct WebConfig {
    server: Port,
}

impl Default for WebConfig {
    fn default() -> Self {
        WebConfig {
            server: Port { port: 9527 },
        }
    }
}

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
struct ClientConfig {
    token: Option<String>,
    server_host: Option<String>,
}

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone, Copy)]
struct Port {
    port: u16,
}

#[derive(Clone, Debug)]
pub struct Config {
    db: Db,
    log_path: PathBuf,
    web_config: WebConfig,
    client_config: ClientConfig,
}

impl Config {
    pub fn new(db: Db, args: Args) -> Self {
        let log_path = args.log_path.unwrap_or_else(|| {
            db.get(LOG_PATH)
                .unwrap()
                .map(|v| String::from_utf8(v.to_vec()).unwrap())
                .unwrap_or(Config::log_path().to_string_lossy().to_string())
        });
        let port = args.port.unwrap_or_else(|| {
            db.get(PORT)
                .unwrap()
                .map(|v| String::from_utf8(v.to_vec()).unwrap())
                .unwrap_or_default()
                .parse::<u16>()
                .unwrap()
        });
        let token: Option<String>;

        if args.token.is_none() {
            token = db.get(TOKEN)
                .unwrap()
                .map(|v| String::from_utf8(v.to_vec()).unwrap());
        } else {
            token = args.token;
        }

        let server_host: Option<String>;
        if args.server_host.is_none() {
            server_host = db.get(SERVER_HOST)
                .unwrap()
                .map(|v| String::from_utf8(v.to_vec()).unwrap());
        } else {
            server_host = args.server_host;
        }

        let config = Config {
            db,
            log_path: PathBuf::from(log_path),
            web_config: WebConfig {
                server: Port { port },
            },
            client_config: ClientConfig {
                token,
                server_host,
            },
        };
        config.init_logging();
        config
    }

    pub fn get_log_path(&self) -> PathBuf {
        self.log_path.clone()
    }

    pub fn server_port(&self) -> u16 {
        self.web_config.server.port
    }

    pub fn token(&self) -> Option<String> {
        self.client_config.token.clone()
    }

    pub fn server_host(&self) -> Option<String> {
        self.client_config.server_host.clone()
    }

    fn init_logging(&self) {
        let log_path = self.get_log_path();
        info!("日志路径: {:?}", log_path);

        // init logging
        let stdout: ConsoleAppender = ConsoleAppender::builder()
            .encoder(Box::new(PatternEncoder::new(
                "[{d(%Y-%m-%d %H:%M:%S)} {T} {l}] {m}{n}",
            )))
            .build();

        // Logging to log file.
        let logfile = FileAppender::builder()
            // Pattern: https://docs.rs/log4rs/*/log4rs/encode/pattern/index.html
            .encoder(Box::new(PatternEncoder::new(
                "[{d(%Y-%m-%d %H:%M:%S)} {T} {l}] {m}{n}",
            )))
            .build(log_path)
            .unwrap();

        let log_config = log4rs::config::Config::builder()
            .appender(Appender::builder().build("stdout", Box::new(stdout)))
            .appender(Appender::builder().build("logfile", Box::new(logfile)))
            .build(
                Root::builder()
                    .appender("stdout")
                    .appender("logfile")
                    .build(LevelFilter::Debug),
            )
            .unwrap();

        log4rs::init_config(log_config).unwrap();
    }

    fn get_config_yml() -> Result<WebConfig> {
        let mut config_path = PathBuf::from("config.yml");
        if let Ok(current_exe) = env::current_exe() {
            if let Some(parent) = current_exe.parent() {
                config_path = parent.join("config.yml");
            }
        }

        let config_file = File::open(config_path)?;
        Ok(serde_yaml::from_reader::<File, WebConfig>(config_file)?)
    }

    pub fn get_server_port() -> u16 {
        let d = Config::get_config_yml().unwrap_or_default();
        d.server.port
    }

    pub fn current_dir() -> PathBuf {
        if let Ok(current_exe) = env::current_exe() {
            if let Some(parent) = current_exe.parent() {
                return parent.to_path_buf();
            }
        }
        env::current_dir().expect("获取当前目录失败, 权限不足或当前目录不存在")
    }

    pub fn log_path() -> PathBuf {
        Config::current_dir().join("web.log")
    }

    pub fn set_client_token(&mut self, token: &str) -> Result<()> {
        self.client_config.token = Some(token.to_string());
        self.db.insert(TOKEN, token.as_bytes())?;
        Ok(())
    }

    pub fn set_server_host(&mut self, server_host: &str) -> Result<()> {
        self.client_config.server_host = Some(server_host.to_string());
        self.db.insert(SERVER_HOST, server_host.as_bytes())?;
        Ok(())
    }
}
