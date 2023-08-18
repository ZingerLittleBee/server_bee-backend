use clap::Parser;

/// ServerBee 的后端配置项
#[derive(Parser, Debug, Clone)]
#[command(author, version, about, long_about = None)]
#[clap(disable_help_flag = true)]
pub struct Args {
    /// 日志路径
    #[clap(short, long)]
    pub log_path: Option<String>,

    /// 端口号, 默认 9527
    #[clap(short, long)]
    pub port: Option<u16>,

    /// 用于和 APP 通信的 Token
    #[clap(short, long)]
    pub app_token: Option<String>,

    /// 用于和服务器通信的 Token
    #[clap(short, long)]
    pub client_token: Option<String>,

    /// 服务器地址, ip 或 domain
    #[clap(short = 'h', long = "host")]
    pub server_host: Option<String>,

    /// 禁用 SSL
    #[clap(long)]
    pub disable_ssl: bool,

    /// 打印帮助信息
    #[arg(long, action = clap::ArgAction::Help)]
    help: Option<bool>,
}
