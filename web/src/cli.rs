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

    /// Token used to communicate with the recorder service
    /// 用于和 recorder 服务通信的 Token
    /// Get from the ServerHub
    /// 从 ServerHub 获取
    #[clap(short, long)]
    pub server_token: Option<String>,

    /// Recorder service url, for example: https://recorder.serverhub.app
    /// Recorder 服务 url, 例如: https://recorder.serverhub.app
    #[clap(short = 'u', long = "url")]
    pub server_url: Option<String>,

    /// enable record, default false.
    /// 启用 recorder, 默认 false
    #[clap(short = 'r', long = "enable-record", default_value = "false")]
    pub enable_record: bool,

    /// record interval, unit second
    /// 上报间隔，单位秒
    #[clap(short = 'i', long = "record-interval", long)]
    pub record_interval: Option<u64>,

    /// Print help information.
    /// 打印帮助信息
    #[arg(long, action = clap::ArgAction::Help)]
    help: Option<bool>,
}
