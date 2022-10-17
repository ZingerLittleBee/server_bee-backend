use crate::cli::Port;
use crate::WebConfig;
use auto_launch::AutoLaunchBuilder;
use std::env;
use std::fs::OpenOptions;
use std::path::{Path, PathBuf};

#[derive(Clone, Copy, Debug)]
pub struct Config<'a> {
    pub port: Port,
    pub version: &'a str,
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

    // Ex CWD/0.0.1/
    pub fn web_bin_dir(&self) -> PathBuf {
        Config::current_dir().join(self.version)
    }

    pub fn log_path(&self) -> PathBuf {
        self.web_bin_dir().join("serverbee-web.log")
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
        let base_url =
            "https://cdn.jsdelivr.net/gh/ZingerLittleBee/server_bee-backend@release/release";

        Path::new(base_url)
            .join(self.version)
            .join(self.get_filename())
    }

    pub fn set_auto_launch(&self, enable: bool) {
        let app_name = env!("CARGO_PKG_NAME");
        println!("自启执行文件: {}", env::current_exe().unwrap().to_str().unwrap());

        let auto = AutoLaunchBuilder::new()
            .set_app_name(app_name)
            .set_app_path(env::current_exe().unwrap().to_str().unwrap())
            .set_use_launch_agent(false)
            .build()
            .expect("Couldn't build auto launch");

        if enable {
            if auto.is_enabled().expect("Couldn't check auto launch") {
                println!("已经设置开机启动");
            } else {
                auto.enable().expect("Couldn't enable auto launch");
                println!("设置开机启动成功");
            }
        } else if auto.is_enabled().expect("Couldn't check auto launch") {
            auto.disable().expect("Couldn't disable auto launch");
            println!("取消开机启动成功");
        } else {
            println!("已经取消开机启动");
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
}
