use clap::Parser;
use serde::{Deserialize, Serialize};

/// Backend configuration of ServerBee.
/// ServerBee 的后端配置项。
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
    /// Port, default is 9527.
    /// 端口号，默认 9527。
    #[clap(short, long)]
    pub port: Option<u16>,

    /// Auto-start on boot? default Auto-start.
    /// 是否开机自启，默认自启。
    #[clap(short, long)]
    pub auto_launch: Option<bool>,

    /// Interactive installation.
    /// 交互式安装。
    #[clap(short, long, default_value = "false")]
    pub interactive: bool,
}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
pub struct WebConfig {
    server: Port,
}

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone, Copy)]
pub struct Port {
    port: u16,
}

impl Port {
    pub fn new(port: u16) -> Self {
        Port { port }
    }

    pub fn get_value(&self) -> u16 {
        self.port
    }
}

impl Default for Port {
    fn default() -> Self {
        Port { port: 9527 }
    }
}
