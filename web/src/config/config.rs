use crate::cli::Args;
use crate::config::app::AppConfig;
use crate::config::constant::{
    APP_CONFIG, DEFAULT_PORT, LAST_LOGIN, LOG_PATH, SERVER_CONFIG, WEB_SERVER_CONFIG,
};
use crate::config::server::ServerConfig;
use crate::config::web_server::WebServerConfig;
use crate::db::db_wrapper::DbWrapper;
use crate::utils::common_util::get_now_timestamp;
use anyhow::Result;
use log::{info, LevelFilter};
use log4rs::append::console::ConsoleAppender;
use log4rs::append::rolling_file::policy::compound::roll::fixed_window::FixedWindowRoller;
use log4rs::append::rolling_file::policy::compound::trigger::size::SizeTrigger;
use log4rs::append::rolling_file::policy::compound::CompoundPolicy;
use log4rs::append::rolling_file::RollingFileAppender;
use log4rs::config::{Appender, Root};
use log4rs::encode::pattern::PatternEncoder;
use std::env;
use std::fs::File;
use std::path::PathBuf;

#[derive(Clone, Debug)]
pub struct Config {
    db: DbWrapper,
    log_path: PathBuf,
    web_server: WebServerConfig,
    server: ServerConfig,
    app: AppConfig,
    last_login: u64,
}

impl Config {
    pub fn new(db: DbWrapper, args: Args) -> Self {
        // merge web server config
        let mut web_server = match db.get(WEB_SERVER_CONFIG) {
            Ok(Some(v)) => v,
            _ => WebServerConfig::new(DEFAULT_PORT),
        };

        args.port.is_some().then(|| {
            web_server.set_port(args.port.unwrap());
            db.set(WEB_SERVER_CONFIG, &web_server);
        });

        // merge server config
        let mut server = match db.get::<ServerConfig>(SERVER_CONFIG) {
            Ok(Some(v)) => v,
            _ => Default::default(),
        };

        server
            .merge(ServerConfig::new(
                args.server_token,
                args.server_host,
                args.disable_ssl,
            ))
            .then(|| {
                db.set(SERVER_CONFIG, &server);
            });

        // merge app config
        let mut app = match db.get::<AppConfig>(APP_CONFIG) {
            Ok(Some(v)) => v,
            _ => Default::default(),
        };

        app.merge(AppConfig::new(args.app_token)).then(|| {
            db.set(APP_CONFIG, &app);
        });

        let log_path = args
            .log_path
            .unwrap_or_else(|| match db.get::<String>(LOG_PATH) {
                Ok(Some(v)) => v,
                _ => Config::current_dir().to_str().unwrap().to_string(),
            });

        let last_login = match db.get::<u64>(LAST_LOGIN) {
            Ok(Some(v)) => v,
            _ => {
                let now = get_now_timestamp();
                db.set(LAST_LOGIN, &now);
                now
            }
        };

        let config = Config {
            db,
            log_path: PathBuf::from(log_path),
            web_server,
            server,
            app,
            last_login,
        };
        config.init_logging();
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

    pub fn last_login(&self) -> u64 {
        self.last_login
    }

    fn init_logging(&self) {
        let log_path = self.log_path();
        let log_file = self.log_file();
        info!("日志文件路径: {:?}", log_file);

        // init logging
        let stdout: ConsoleAppender = ConsoleAppender::builder()
            .encoder(Box::new(PatternEncoder::new(
                "[{d(%Y-%m-%d %H:%M:%S)} {T} {h({l})}] {m}{n}",
            )))
            .build();

        // Logging to log file.
        // let logfile = FileAppender::builder()
        //     // Pattern: https://docs.rs/log4rs/*/log4rs/encode/pattern/index.html
        //     .encoder(Box::new(PatternEncoder::new(
        //         "[{d(%Y-%m-%d %H:%M:%S)} {T} {h({l})}] {m}{n}",
        //     )))
        //     .build(log_path)
        //     .unwrap();

        // rolling log file.
        let window_roller = FixedWindowRoller::builder()
            .build(
                &format!("{}/archive/serverbee.{}.log.gz", log_path.display(), "{}"),
                5,
            )
            .unwrap();
        let size_trigger = SizeTrigger::new(10_000_000); // 10 MB
        let compound_policy = CompoundPolicy::new(Box::new(size_trigger), Box::new(window_roller));

        let rolling_logfile = RollingFileAppender::builder()
            .encoder(Box::new(PatternEncoder::new(
                "[{d(%Y-%m-%d %H:%M:%S)} {T} {h({l})}] {m}{n}",
            )))
            .build(log_file, Box::new(compound_policy))
            .unwrap();

        let log_config = log4rs::config::Config::builder()
            .appender(Appender::builder().build("stdout", Box::new(stdout)))
            .appender(Appender::builder().build("logfile", Box::new(rolling_logfile)))
            .build(
                Root::builder()
                    .appender("stdout")
                    .appender("logfile")
                    .build(LevelFilter::Info),
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

    fn current_dir() -> PathBuf {
        if let Ok(current_exe) = env::current_exe() {
            if let Some(parent) = current_exe.parent() {
                return parent.to_path_buf();
            }
        }
        env::current_dir().expect("获取当前目录失败, 权限不足或当前目录不存在")
    }

    pub fn log_path(&self) -> PathBuf {
        self.log_path.clone()
    }

    pub fn log_file(&self) -> PathBuf {
        self.log_path().join("web.log")
    }

    pub fn set_web_server_config(&mut self, config: WebServerConfig) -> Result<()> {
        info!("Web Server config change: {:?}", config);
        self.web_server.merge(config).then(|| {
            self.db
                .set::<WebServerConfig>(WEB_SERVER_CONFIG, &self.web_server);
        });
        Ok(())
    }

    pub fn set_app_token(&mut self, token: Option<String>) -> Result<()> {
        self.app.set_token(token);
        self.db.set::<AppConfig>(APP_CONFIG, &self.app);
        Ok(())
    }

    pub fn set_app_config(&mut self, config: AppConfig) -> Result<()> {
        self.app.merge(config).then(|| {
            self.db.set::<AppConfig>(APP_CONFIG, &self.app);
        });
        Ok(())
    }

    pub fn set_server_token(&mut self, token: &str) -> Result<()> {
        self.server.set_token(Some(token.to_string()));
        self.db.set::<ServerConfig>(SERVER_CONFIG, &self.server);
        Ok(())
    }

    pub fn set_server_host(&mut self, host: &str) -> Result<()> {
        self.server.set_host(Some(host.to_string()));
        self.db.set::<ServerConfig>(SERVER_CONFIG, &self.server);
        Ok(())
    }

    pub fn set_server_config(&mut self, config: ServerConfig) -> Result<()> {
        self.server.merge(config).then(|| {
            self.db.set::<ServerConfig>(SERVER_CONFIG, &self.server);
        });
        Ok(())
    }

    pub fn set_last_login(&mut self, last_login: u64) -> Result<()> {
        self.last_login = last_login;
        self.db.set::<u64>(LAST_LOGIN, &self.last_login);
        Ok(())
    }

    pub fn set_last_login_now(&mut self) -> Result<()> {
        let now = get_now_timestamp();
        self.set_last_login(now)
    }
}
