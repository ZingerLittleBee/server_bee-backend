use clap::Parser;

/// ServerBee 的后端配置项
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
    /// 端口号, 默认 9527
    #[clap(short, long)]
    pub port: Option<u16>,

    /// 日志路径
    #[clap(short, long)]
    pub log_path: Option<String>,
}
