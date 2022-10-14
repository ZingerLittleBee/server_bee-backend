use crate::cli::Port;
use crate::WebConfig;
use auto_launch::AutoLaunchBuilder;
use std::env;
use std::fs::OpenOptions;
use std::path::{Path, PathBuf};

#[derive(Clone, Copy, Debug)]
pub struct Config<'a> {
    port: Port,
    version: &'a str,
}

impl<'a> Config<'a> {
    pub fn new() -> Self {
        Self {
            port: Default::default(),
            version: env!("CARGO_PKG_VERSION"),
        }
    }

    pub fn set_version(mut self, version: &'a str) {
        self.version = version;
    }

    pub fn set_port(mut self, port: Port) {
        self.port = port;
        let web_config = WebConfig::new(self.port);
        let f = OpenOptions::new()
            .write(true)
            .create(true)
            .open("config.yml")
            .expect("Couldn't open file");
        serde_yaml::to_writer(f, &web_config).unwrap();
    }

    pub fn get_filename(&self) -> String {
        if cfg!(target_os = "macos") {
            format!("serverbee-web-x86_64-apple-darwin-{}.zip", self.version)
        } else if cfg!(target_os = "linux") {
            format!(
                "serverbee-web-x86_64-unknown-linux-musl-{}.zip",
                self.version
            )
        } else if cfg!(target_os = "windows") {
            format!("serverbee-web-x86_64-pc-windows-gnu-{}.zip", self.version)
        } else {
            println!("unknown os");
            format!(
                "serverbee-web-x86_64-unknown-linux-musl-{}.zip",
                self.version
            )
        }
    }

    pub fn web_bin_path() -> PathBuf {
        Config::current_dir().join("serverbee-web")
    }

    pub fn web_bin_zip_path(&self) -> PathBuf {
        Config::current_dir().join(self.get_filename())
    }

    pub fn url(&self) -> PathBuf {
        let base_url =
            "https://cdn.jsdelivr.net/gh/ZingerLittleBee/server_bee-backend@release/release";

        Path::new(base_url)
            .join(self.version)
            .join(self.get_filename())
    }

    pub fn set_auto_launch(&self, enable: bool) {
        let app_name = env!("CARGO_PKG_NAME");
        println!("自启执行文件: {}", self.deploy_bin_path().display());

        let auto = AutoLaunchBuilder::new()
            .set_app_name(app_name)
            .set_app_path(self.deploy_bin_path().to_str().unwrap())
            .set_use_launch_agent(false)
            .build()
            .unwrap();

        if enable {
            if auto.is_enabled().unwrap() {
                println!("已经设置开机启动");
            } else {
                auto.enable().unwrap();
                println!("设置开机启动成功");
            }
        } else if auto.is_enabled().unwrap() {
            auto.disable().unwrap();
            println!("取消开机启动成功");
        } else {
            println!("已经取消开机启动");
        }
    }

    fn current_dir() -> PathBuf {
        env::current_dir().expect("获取当前目录失败, 权限不足或当前目录不存在")
    }

    fn deploy_bin_path(&self) -> PathBuf {
        let app_name = env!("CARGO_PKG_NAME");
        if cfg!(target_os = "windows") {
            Config::current_dir()
                .as_path()
                .join(format!("{}.exe", app_name))
        } else {
            Config::current_dir().as_path().join(app_name)
        }
    }
}
