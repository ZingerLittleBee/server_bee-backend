use clap::Parser;

/// ServerBee 的后端配置项
#[derive(Parser, Debug, Clone)]
#[command(author, version, about, long_about = None)]
#[clap(disable_help_flag = true)]
pub struct Args {
    /// Log directory, defaults to the current directory where the program is located.
    /// 日志目录, 默认为程序所在当前目录
    #[clap(short, long)]
    pub log_dir: Option<String>,

    /// Data directory, defaults to the current directory where the program is located.
    /// 数据目录, 默认为程序所在当前目录
    #[clap(short, long)]
    pub data_dir: Option<String>,

    /// port, default 9527.
    /// 端口号, 默认 9527
    #[clap(short, long)]
    pub port: Option<u16>,

    /// Token used to communicate with APP
    /// 用于和 APP 通信的 Token
    #[clap(short, long)]
    pub app_token: Option<String>,

    /// Token used to communicate with the server
    /// 用于和服务器通信的 Token
    #[clap(short, long)]
    pub server_token: Option<String>,

    /// ServerHub address, ip or domain.
    /// 服务器地址, ip 或 domain
    #[clap(short = 'h', long = "host")]
    pub server_host: Option<String>,

    /// Disable SSL
    /// 禁用 SSL
    #[clap(long)]
    pub disable_ssl: bool,

    /// Print help information.
    /// 打印帮助信息
    #[arg(long, action = clap::ArgAction::Help)]
    help: Option<bool>,
}
