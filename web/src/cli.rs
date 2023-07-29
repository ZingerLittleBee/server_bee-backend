use clap::Parser;

/// ServerBee 的后端配置项
#[derive(Parser, Debug, Clone)]
#[command(author, version, about, long_about = None)]
pub struct Args {
    /// 端口号, 默认 9527
    #[clap(short, long)]
    pub port: Option<u16>,

    /// 日志路径
    #[clap(short, long)]
    pub log_path: Option<String>,

    /// 服务器颁发的 Token
    #[clap(short, long)]
    pub token: Option<String>,

    /// 服务器地址, ip 或 domain
    #[clap(short, long)]
    pub server_host: Option<String>,
}
