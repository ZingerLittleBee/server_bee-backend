use crate::cli::Port;
use crate::constant::BASE_URL;
use crate::storage_config::StorageConfig;
use anyhow::Result;
use auto_launch::AutoLaunchBuilder;
use futures_util::StreamExt;
use indicatif::{ProgressBar, ProgressStyle};
use log::{info, warn, LevelFilter};
use log4rs::append::console::ConsoleAppender;
use log4rs::append::file::FileAppender;
use log4rs::config::{Appender, Root};
use log4rs::encode::pattern::PatternEncoder;
use reqwest::header;
use std::cmp::min;
use std::env;
use std::fs::File;
use std::io::Write;
use std::path::{Path, PathBuf};

#[derive(Clone, Debug)]
pub struct Config {
    port: Port,
    version: String,
    storage_config: StorageConfig,
}

impl Config {
    pub fn new() -> Self {
        let mut port: Port = Default::default();
        let mut storage_config = StorageConfig::new();

        if let Some(storage_port) = storage_config.port {
            port = Port::new(storage_port);
        }

        if storage_config.port.is_none() {
            storage_config.set_port(port);
        }

        Self {
            port,
            version: env!("CARGO_PKG_VERSION").into(),
            storage_config,
        }
    }

    pub fn get_interactive(&self) -> bool {
        self.storage_config.get_interactive().unwrap_or(true)
    }

    pub fn set_interactive(&mut self, interactive: bool) {
        self.storage_config.set_interactive(interactive);
    }

    pub fn get_auto_launch(&self) -> bool {
        self.storage_config.get_auto_launch()
    }

    pub fn get_version(&self) -> String {
        if self.version.starts_with('v') {
            self.version.clone()
        } else {
            format!("v{}", self.version)
        }
    }

    pub fn get_port(&self) -> u16 {
        self.port.get_value()
    }

    pub fn set_version(&mut self, version: String) {
        self.version = version;
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

    pub fn set_port(&mut self, port: Port) {
        self.port = port;
        self.storage_config.set_port(port);

        // let web_config = WebConfig::new(self.port);
        // let f = OpenOptions::new()
        //     .write(true)
        //     .create(true)
        //     .open(self.web_bin_dir().join("config.yml"))
        //     .expect("Couldn't open config.yml file");
        // serde_yaml::to_writer(f, &web_config).unwrap();
    }

    pub fn get_locale(&self) -> String {
        self.storage_config.get_locale()
    }

    pub fn set_locale(&mut self, locale: String) {
        self.storage_config.set_locale(locale);
    }

    #[cfg(target_arch = "x86_64")]
    pub fn get_filename(&self) -> String {
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

    #[cfg(target_arch = "aarch64")]
    pub fn get_filename(&self) -> String {
        if cfg!(target_os = "macos") {
            "serverbee-web-aarch64-apple-darwin.zip".into()
        } else if cfg!(target_os = "linux") {
            "serverbee-web-aarch64-unknown-linux-musl.zip".into()
        } else if cfg!(target_os = "windows") {
            "serverbee-web-aarch64-pc-windows-gnu.zip".into()
        } else {
            warn!("unknown os");
            "serverbee-web-aarch64-unknown-linux-musl.zip".into()
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
        self.web_bin_dir().join(self.get_filename())
    }

    pub fn bin_zip_url(&self) -> PathBuf {
        Path::new(BASE_URL)
            .join(self.get_version())
            .join(self.get_filename())
    }

    pub fn set_auto_launch(&mut self, enable: bool) {
        let app_name = env!("CARGO_PKG_NAME");
        info!(
            "{}: {}",
            t!("auto_launch_file_path"),
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
                info!("{}", t!("already_auto_launch"));
            }
        } else if auto.is_enabled().expect("Couldn't check auto launch") {
            auto.disable().expect("Couldn't disable auto launch");
            info!("{}", t!("cancel_auto_launch"));
        } else {
            info!("{}", t!("cancel_auto_launch"));
        }

        self.storage_config.set_auto_launch(enable);
    }

    pub fn current_dir() -> PathBuf {
        if let Ok(current_exe) = env::current_exe() {
            if let Some(parent) = current_exe.parent() {
                return parent.to_path_buf();
            }
        }
        env::current_dir().expect(t!("failed_to_get_current_dir").as_str())
    }

    pub fn deploy_log_path() -> PathBuf {
        Config::current_dir().join("deploy.log")
    }

    async fn get_latest_version_from_status(include_pre: Option<bool>) -> Result<String> {
        let can_pre = include_pre.unwrap_or(false);
        let client = reqwest::Client::new();
        let response = client
            .get(format!(
                "https://status.serverbee.app/api/{}",
                if can_pre { "pre-version" } else { "version" }
            ))
            // .header(header::AUTHORIZATION, format!("token {}", token))
            .header(header::USER_AGENT, "reqwest")
            .send()
            .await?
            .error_for_status()?;

        Ok(response.text().await?)
    }

    async fn get_latest_version_from_github() -> Result<String> {
        let client = reqwest::Client::new();
        let response = client
            .get("https://api.github.com/repos/ZingerLittleBee/server_bee-backend/releases/latest")
            // .header(header::AUTHORIZATION, format!("token {}", token))
            .header(header::USER_AGENT, "reqwest")
            .send()
            .await?
            .error_for_status()?;

        let text = response.text().await?;

        let latest_version: serde_json::Value = serde_json::from_str(&text)?;

        if let Some(version_value) = latest_version.get("tag_name") {
            if let Some(version_str) = version_value.as_str() {
                return Ok(version_str.to_string().replace('v', ""));
            }
        }
        Ok("".into())
    }

    async fn get_latest_version_from_jsdelivr() -> Result<String> {
        let latest_version = reqwest::get(
            "https://data.jsdelivr.com/v1/package/gh/ZingerLittleBee/server_bee-backend",
        )
        .await?
        .json::<serde_json::Value>()
        .await?;

        if let Some(version_value) = latest_version.get("versions") {
            if let Some(version_vec) = version_value.as_array() {
                if let Some(version) = version_vec.first() {
                    if let Some(version_str) = version.as_str() {
                        return Ok(version_str.to_string());
                    }
                }
            }
        }
        Ok("".into())
    }

    pub async fn get_latest_version() -> Result<String> {
        match Config::get_latest_version_from_status(Some(false)).await {
            Ok(version) => {
                if !version.is_empty() {
                    return Ok(version);
                }
            }
            Err(e) => {
                warn!("{}", t!("failed_to_get_version_from_status", error = e));
            }
        }

        match Config::get_latest_version_from_github().await {
            Ok(version) => {
                if !version.is_empty() {
                    return Ok(version);
                }
            }
            Err(e) => {
                warn!("{}", t!("failed_to_get_version_from_github", error = e));
            }
        }

        if let Ok(version) = Config::get_latest_version_from_jsdelivr().await {
            if !version.is_empty() {
                return Ok(version);
            }
        } else {
            warn!("{}", t!("failed_to_get_version_from_jsdelivr"));
        }
        warn!(
            "{}: {}",
            t!("use_version_from_cargo_toml"),
            env!("CARGO_PKG_VERSION")
        );
        Ok(env!("CARGO_PKG_VERSION").into())
    }

    pub async fn download_bin(&self) -> Result<()> {
        // Reqwest setup
        let res = reqwest::Client::new()
            .get(self.bin_zip_url().to_str().unwrap())
            .send()
            .await
            .map_err(|_| format!("Failed to Download from '{}'", self.bin_zip_url().display()))
            .unwrap();
        let total_size = res
            .content_length()
            .ok_or(format!(
                "Failed to get content length from '{}'",
                self.bin_zip_url().display()
            ))
            .unwrap();

        // Indicatif setup
        let pb = ProgressBar::new(total_size);
        pb.set_style(ProgressStyle::default_bar()
            .template("{msg}\n{spinner:.green} [{elapsed_precise}] [{wide_bar:.cyan/blue}] {bytes}/{total_bytes} ({bytes_per_sec}, {eta})")?
            .progress_chars("#>-"));
        pb.set_message(format!("Downloading {}", self.bin_zip_url().display()));

        // download chunks
        let mut file = File::create(self.web_bin_zip_path())
            .map_err(|_| {
                format!(
                    "Failed to create file '{}'",
                    self.web_bin_zip_path().display()
                )
            })
            .unwrap();
        let mut downloaded: u64 = 0;
        let mut stream = res.bytes_stream();

        while let Some(item) = stream.next().await {
            let chunk = item
                .map_err(|_| "Error while downloading file".to_string())
                .unwrap();
            file.write_all(&chunk)
                .map_err(|_| "Error while writing to file".to_string())
                .unwrap();
            let new = min(downloaded + (chunk.len() as u64), total_size);
            downloaded = new;
            pb.set_position(new);
        }

        pb.finish_with_message(format!(
            "Downloaded {} to {}",
            self.bin_zip_url().display(),
            self.web_bin_zip_path().display()
        ));
        Ok(())
    }
}
