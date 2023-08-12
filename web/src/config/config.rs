use crate::cli::Args;
use crate::config::constant::{APP_TOKEN, CLIENT_TOKEN, DEFAULT_PORT, LOG_PATH, PORT, SERVER_HOST};
use crate::traits::json_response::JsonResponder;
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
pub struct ClientConfig {
    token: Option<String>,
    server_host: Option<String>,
}

impl JsonResponder for ClientConfig {}

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub struct AppConfig {
    token: Option<String>,
}

impl JsonResponder for AppConfig {}

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
    app_config: AppConfig,
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
                .map(|v| {
                    String::from_utf8(v.to_vec())
                        .map(|s| s.parse::<u16>().unwrap())
                        .unwrap()
                })
                .unwrap_or(DEFAULT_PORT)
        });

        let app_token: Option<String>;
        if args.app_token.is_none() {
            app_token = db
                .get(APP_TOKEN)
                .unwrap()
                .map(|v| String::from_utf8(v.to_vec()).unwrap());
        } else {
            app_token = args.app_token;
        }

        let client_token: Option<String>;
        if args.client_token.is_none() {
            client_token = db
                .get(CLIENT_TOKEN)
                .unwrap()
                .map(|v| String::from_utf8(v.to_vec()).unwrap());
        } else {
            client_token = args.client_token;
        }

        let server_host: Option<String>;
        if args.server_host.is_none() {
            server_host = db
                .get(SERVER_HOST)
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
                token: client_token,
                server_host,
            },
            app_config: AppConfig { token: app_token },
        };
        config.init_logging();
        config.persistence();
        config
    }

    pub fn get_log_path(&self) -> PathBuf {
        self.log_path.clone()
    }

    pub fn server_port(&self) -> u16 {
        self.web_config.server.port
    }

    pub fn app_token(&self) -> Option<String> {
        self.app_config.token.clone()
    }

    pub fn client_token(&self) -> Option<String> {
        self.client_config.token.clone()
    }

    pub fn client_config(&self) -> ClientConfig {
        self.client_config.clone()
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

    pub fn set_app_token(&mut self, token: &str) -> Result<()> {
        self.app_config.token = Some(token.to_string());
        self.db.insert(APP_TOKEN, token.as_bytes())?;
        Ok(())
    }

    pub fn set_client_token(&mut self, token: &str) -> Result<()> {
        self.client_config.token = Some(token.to_string());
        self.db.insert(CLIENT_TOKEN, token.as_bytes())?;
        Ok(())
    }

    pub fn set_client_config(&mut self, config: ClientConfig) -> Result<()> {
        self.client_config = config;
        if let Some(token) = &self.client_config.token {
            self.db.insert(CLIENT_TOKEN, token.as_bytes())?;
        }
        if let Some(server_host) = &self.client_config.server_host {
            self.db.insert(SERVER_HOST, server_host.as_bytes())?;
        }
        Ok(())
    }

    pub fn set_server_host(&mut self, server_host: &str) -> Result<()> {
        self.client_config.server_host = Some(server_host.to_string());
        self.db.insert(SERVER_HOST, server_host.as_bytes())?;
        Ok(())
    }

    fn persistence(&self) {
        self.db
            .insert(PORT, self.web_config.server.port.to_string().as_bytes())
            .unwrap();
        self.db
            .insert(LOG_PATH, self.log_path.to_str().unwrap().as_bytes())
            .unwrap();
        if let Some(token) = &self.app_config.token {
            self.db.insert(APP_TOKEN, token.as_bytes()).unwrap();
        }
        if let Some(token) = &self.client_config.token {
            self.db.insert(CLIENT_TOKEN, token.as_bytes()).unwrap();
        }
        if let Some(server_host) = &self.client_config.server_host {
            self.db.insert(SERVER_HOST, server_host.as_bytes()).unwrap();
        }
    }
}
