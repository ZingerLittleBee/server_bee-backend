use crate::cli::Port;
use crate::WebConfig;
use auto_launch::AutoLaunchBuilder;
use log::{info, warn, LevelFilter};
use log4rs::append::console::ConsoleAppender;
use log4rs::append::file::FileAppender;
use log4rs::config::{Appender, Root};
use log4rs::encode::pattern::PatternEncoder;
use std::env;
use std::fs::OpenOptions;
use std::path::{Path, PathBuf};
use crate::storage_config::StorageConfig;

#[derive(Clone, Debug)]
pub struct Config {
    pub port: Port,
    pub is_auto_launch: bool,
    pub storage_config: StorageConfig,
}

impl Config {
    pub fn new() -> Self {
        let mut port = Default::default();
        let mut is_auto_launch = true;
        let storage_config = StorageConfig::new();

        if let Some(storage_port) = storage_config.port {
            port = storage_port;
        }
        if let Some(storage_is_auto_launch) = storage_config.is_auto_launch {
            is_auto_launch = storage_is_auto_launch;
        }

        Self {
            port,
            is_auto_launch,
            storage_config,
        }
    }

    pub fn get_version(&self) -> String {
        self.storage_config.get_version()
    }

    pub fn init_logging() {
        // init logging
        let stdout: ConsoleAppender = ConsoleAppender::builder()
            .encoder(Box::new(PatternEncoder::new(
                "[{d(%Y-%m-%d %H:%M:%S)} {l}] {m}{n}",
            )))
            .build();

        // Logging to log file.
        let logfile = FileAppender::builder()
            // Pattern: https://docs.rs/log4rs/*/log4rs/encode/pattern/index.html
            .encoder(Box::new(PatternEncoder::new(
                "[{d(%Y-%m-%d %H:%M:%S)} {l}] {m}{n}",
            )))
            .build(Config::deploy_log_path())
            .unwrap();

        let log_config = log4rs::config::Config::builder()
            .appender(Appender::builder().build("stdout", Box::new(stdout)))
            .appender(Appender::builder().build("logfile", Box::new(logfile)))
            .build(
                Root::builder()
                    .appender("stdout")
                    .appender("logfile")
                    .build(LevelFilter::Info),
            )
            .unwrap();
        log4rs::init_config(log_config).unwrap();
    }

    pub fn set_version(&mut self, version: &str) {
        self.storage_config.version = Some(version.into());
        self.storage_config.save_config();
    }

    pub fn set_port(&mut self, port: Port) {
        self.port = port;
        let web_config = WebConfig::new(self.port);
        let f = OpenOptions::new()
            .write(true)
            .create(true)
            .open(self.web_bin_dir().join("config.yml"))
            .expect("Couldn't open config.yml file");
        serde_yaml::to_writer(f, &web_config).unwrap();
    }

    pub fn get_filename() -> String {
        if cfg!(target_os = "macos") {
            "serverbee-web-x86_64-apple-darwin.zip".into()
        } else if cfg!(target_os = "linux") {
            "serverbee-web-x86_64-unknown-linux-musl.zip".into()
        } else if cfg!(target_os = "windows") {
            "serverbee-web-x86_64-pc-windows-gnu.zip".into()
        } else {
            warn!("unknown os");
            "serverbee-web-x86_64-unknown-linux-musl.zip".into()
        }
    }

    // Ex CWD/0.0.1/
    pub fn web_bin_dir(&self) -> PathBuf {
        Config::current_dir().join(self.get_version())
    }

    pub fn web_bin_path(&self) -> PathBuf {
        if cfg!(target_os = "windows") {
            self.web_bin_dir().join("serverbee-web.exe")
        } else {
            self.web_bin_dir().join("serverbee-web")
        }
    }

    pub fn web_bin_zip_path(&self) -> PathBuf {
        self.web_bin_dir().join(Config::get_filename())
    }

    pub fn bin_zip_url(&self) -> PathBuf {
        let base_url = "https://serverbee-1253263310.cos.ap-shanghai.myqcloud.com";

        Path::new(base_url)
            .join(self.get_version())
            .join(Config::get_filename())
    }

    pub fn set_auto_launch(&self, enable: bool) {
        let app_name = env!("CARGO_PKG_NAME");
        info!(
            "自启执行文件: {}",
            env::current_exe().unwrap().to_str().unwrap()
        );

        let auto = AutoLaunchBuilder::new()
            .set_app_name(app_name)
            .set_app_path(env::current_exe().unwrap().to_str().unwrap())
            .set_use_launch_agent(false)
            .build()
            .expect("Couldn't build auto launch");

        if enable {
            if auto.is_enabled().expect("Couldn't check auto launch") {
                info!("开机启动项已存在, 无需重复设置");
            }
        } else if auto.is_enabled().expect("Couldn't check auto launch") {
            auto.disable().expect("Couldn't disable auto launch");
            info!("取消开机启动成功");
        } else {
            info!("已经取消开机启动");
        }
    }

    pub fn current_dir() -> PathBuf {
        if let Ok(current_exe) = env::current_exe() {
            if let Some(parent) = current_exe.parent() {
                return parent.to_path_buf();
            }
        }
        env::current_dir().expect("获取当前目录失败, 权限不足或当前目录不存在")
    }

    pub fn deploy_log_path() -> PathBuf {
        Config::current_dir().join("deploy.log")
    }
}
