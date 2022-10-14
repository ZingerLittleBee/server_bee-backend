use clap::Parser;
use serde::{Deserialize, Serialize};

/// ServerBee 的后端配置项
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
    /// 端口号, 默认 8080
    #[clap(short, long)]
    pub port: Option<u16>,

    /// 版本号, 默认使用最新版本
    #[clap(short, long)]
    pub release: Option<String>,

    /// 是否开机自启, 默认自启
    #[clap(short, long)]
    pub auto_launch: bool,
}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
pub struct WebConfig {
    server: Port,
}

impl WebConfig {
    pub fn new(port: Port) -> Self {
        WebConfig { server: port }
    }
}

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone, Copy)]
pub struct Port {
    port: u16,
}

impl Port {
    pub fn new(port: u16) -> Self {
        Port { port }
    }
}

impl Default for Port {
    fn default() -> Self {
        Port { port: 8080 }
    }
}
