use crate::cli::Args;
use crate::config::app::AppConfig;
use crate::config::constant::{APP_TOKEN, DEFAULT_PORT, LOG_PATH, PORT, SERVER_HOST, SERVER_TOKEN};
use crate::config::server::ServerConfig;
use crate::config::web_server::WebServerConfig;
use anyhow::Result;
use log::{info, LevelFilter};
use log4rs::append::console::ConsoleAppender;
use log4rs::append::file::FileAppender;
use log4rs::config::{Appender, Root};
use log4rs::encode::pattern::PatternEncoder;
use sled::Db;
use std::env;
use std::fs::File;
use std::path::PathBuf;

#[derive(Clone, Debug)]
pub struct Config {
    db: Db,
    log_path: PathBuf,
    web_server: WebServerConfig,
    server: ServerConfig,
    app: AppConfig,
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

        let server_token: Option<String>;
        if args.server_token.is_none() {
            server_token = db
                .get(SERVER_TOKEN)
                .unwrap()
                .map(|v| String::from_utf8(v.to_vec()).unwrap());
        } else {
            server_token = args.server_token;
        }

        let host: Option<String>;
        if args.server_host.is_none() {
            host = db
                .get(SERVER_HOST)
                .unwrap()
                .map(|v| String::from_utf8(v.to_vec()).unwrap());
        } else {
            host = args.server_host;
        }

        let config = Config {
            db,
            log_path: PathBuf::from(log_path),
            web_server: WebServerConfig::new(port),
            server: ServerConfig::new(server_token, host, args.disable_ssl),
            app: AppConfig::new(app_token),
        };
        config.init_logging();
        config.persistence();
        config
    }

    pub fn web_server_config(&self) -> WebServerConfig {
        self.web_server.clone()
    }

    pub fn server_config(&self) -> ServerConfig {
        self.server.clone()
    }

    pub fn app_config(&self) -> AppConfig {
        self.app.clone()
    }

    pub fn get_log_path(&self) -> PathBuf {
        self.log_path.clone()
    }

    pub fn server_port(&self) -> u16 {
        self.web_server.port()
    }

    pub fn app_token(&self) -> Option<String> {
        self.app.token()
    }

    pub fn server_token(&self) -> Option<String> {
        self.server.token()
    }

    pub fn server_host(&self) -> Option<String> {
        self.server.host()
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
                "[{d(%Y-%m-%d %H:%M:%S)} {T} {h({l})}] {m}{n}",
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

    fn get_config_yml() -> Result<WebServerConfig> {
        let mut config_path = PathBuf::from("config.yml");
        if let Ok(current_exe) = env::current_exe() {
            if let Some(parent) = current_exe.parent() {
                config_path = parent.join("config.yml");
            }
        }

        let config_file = File::open(config_path)?;
        Ok(serde_yaml::from_reader::<File, WebServerConfig>(
            config_file,
        )?)
    }

    pub fn get_server_port() -> u16 {
        let d = Config::get_config_yml().unwrap_or_default();
        d.port()
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
        self.app.set_token(Some(token.to_string()));
        self.db.insert(APP_TOKEN, token.as_bytes())?;
        Ok(())
    }

    pub fn set_server_token(&mut self, token: &str) -> Result<()> {
        self.server.set_token(Some(token.to_string()));
        self.db.insert(SERVER_TOKEN, token.as_bytes())?;
        Ok(())
    }

    pub fn set_server_config(&mut self, config: ServerConfig) -> Result<()> {
        self.server = config;
        if let Some(token) = &self.server.token() {
            self.db.insert(SERVER_TOKEN, token.as_bytes())?;
        }
        if let Some(server_host) = &self.server.host() {
            self.db.insert(SERVER_HOST, server_host.as_bytes())?;
        }
        Ok(())
    }

    pub fn set_server_host(&mut self, host: &str) -> Result<()> {
        self.server.set_host(Some(host.to_string()));
        self.db.insert(SERVER_HOST, host.as_bytes())?;
        Ok(())
    }

    fn persistence(&self) {
        self.db
            .insert(PORT, self.web_server.port().to_string().as_bytes())
            .unwrap();
        self.db
            .insert(LOG_PATH, self.log_path.to_str().unwrap().as_bytes())
            .unwrap();
        if let Some(token) = &self.app.token() {
            self.db.insert(APP_TOKEN, token.as_bytes()).unwrap();
        }
        if let Some(token) = &self.server.token() {
            self.db.insert(SERVER_TOKEN, token.as_bytes()).unwrap();
        }
        if let Some(server_host) = &self.server.host() {
            self.db.insert(SERVER_HOST, server_host.as_bytes()).unwrap();
        }
    }
}
