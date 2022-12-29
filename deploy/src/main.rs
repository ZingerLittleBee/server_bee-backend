#![cfg_attr(feature = "subsystem", windows_subsystem = "windows")]

mod cli;
mod config;
mod storage_config;

use crate::cli::Port;
use crate::config::Config;
use anyhow::Result;
use clap::Parser;
use cli::Args;
use std::fs::File;
use std::process::Command;
use std::{fs, io};
use std::io::stdin;
use std::path::{Path, PathBuf};
use inquire::{Select, Text};
use inquire::validator::{ErrorMessage, Validation};
use log::info;
use port_selector::is_free;


#[tokio::main]
async fn main() -> Result<()> {

    let args = Args::parse();

    let mut config  = Config::new();

    if config.get_interactive() || args.interactive {
        interactive_install(&mut config);
    }

    Config::init_logging();

    if args.domestic_download {
        config.set_is_github_download(false);
    }

    if args.foreign_download {
        config.set_is_github_download(true);
    }

    if args.port.is_some() {
        config.set_port(Port::new(args.port.unwrap()));
    }

    let latest_version = Config::get_latest_version().await?;
    info!("最新版本: {}", latest_version);
    config.set_version(latest_version);

    if !Path::new(config.web_bin_path().as_path().to_str().unwrap()).exists() {

        let web_file_path = config.web_bin_zip_path();

        if let Some(p) = web_file_path.parent() {
            if !p.exists() {
                fs::create_dir_all(&p).unwrap();
            }
        }

        config.download_bin().await?;

        info!("文件 {} 下载成功, 正在解压", web_file_path.display());

        let tokio_file = tokio::fs::File::open(web_file_path).await?;
        let std_file = tokio_file.into_std().await;

        unzip(std_file, config.web_bin_dir());
        info!("文件解压完毕");
    } else {
        info!("文件已存在, 跳过下载");
    }

    config.set_auto_launch(args.auto_launch.unwrap_or_else(|| config.get_auto_launch()));

    start_process(config.web_bin_path().to_str().unwrap(), config.get_port());

    info!("启动成功");

    if config.get_interactive() {
        config.set_interactive(false);
    }

    Ok(())
}

fn unzip(file: File, out_dir: PathBuf) {
    let mut archive = zip::ZipArchive::new(file).unwrap();

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();

        let file_name = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };

        let outpath = out_dir.join(file_name);

        {
            let comment = file.comment();
            if !comment.is_empty() {
                info!("File {} comment: {}", i, comment);
            }
        }

        if (*file.name()).ends_with('/') {
            info!("文件提取到: \"{}\"", outpath.display());
            fs::create_dir_all(&outpath).unwrap();
        } else {
            info!(
                "文件提取到: \"{}\" ({} bytes)",
                outpath.display(),
                file.size()
            );
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(&p).unwrap();
                }
            }
            let mut outfile = File::create(&outpath).unwrap();
            io::copy(&mut file, &mut outfile).unwrap();
        }

        // Get and Set permissions
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;

            if let Some(mode) = file.unix_mode() {
                fs::set_permissions(&outpath, fs::Permissions::from_mode(mode)).unwrap();
            }
        }
    }
}

#[cfg(windows)]
fn start_process(bin_full_path: &str, port: u16) {

    info!(
        "文件全路径: {}",
        bin_full_path
    );

    Command::new("powershell")
        .args(["/C", bin_full_path])
        .args(["-p", port.to_string().as_str()])
        .spawn()
        .expect("运行 serverbee-web.exe 失败, 请尝试手动运行");
}

#[cfg(not(windows))]
fn start_process(bin_full_path: &str, port: u16) {

    info!(
        "文件全路径: {}",
        bin_full_path
    );

    Command::new(bin_full_path)
        .arg("-p")
        .arg(port.to_string())
        .spawn()
        .expect(&*format!("运行 {} 失败, 请尝试手动运行", bin_full_path));
}

fn interactive_install(config: &mut Config) {
        let port_ans = Text::new("请输入端口号? (默认使用 9527)")
            .with_validator(|s: &str| {
                let port;
                if let Ok(p) = s.parse::<u16>() {
                    port = p;
                } else if s.is_empty() { port = 9527 } else {
                    return Ok(Validation::Invalid(ErrorMessage::from("端口号输入有误")));
                }
                if !is_free(port) {
                    return Ok(Validation::Invalid(ErrorMessage::from(format!("端口: {} 已被占用, 请更换其他端口", port))));
                }
                Ok(Validation::Valid)
            }).prompt();

        match port_ans {
            Ok(port) => config.set_port(Port::new(port.parse::<u16>().unwrap_or(9527))),
            Err(_) =>
                panic!("出现错误，请重试"),
        }

        let mirror_repository_options = vec![
            "国外镜像(Github)",
            "国内镜像",
        ];

        let mirror_repository_ans = Select::new("请选择镜像仓库", mirror_repository_options.clone()).with_help_message("↑↓ 移动, 回车确定✅ , 输入以筛选").prompt();

        match mirror_repository_ans {
            Ok(choice) => {
                if choice == mirror_repository_options[0] { config.set_is_github_download(true) } else {
                    config.set_is_github_download(false)
                }
            },
            Err(_) =>
                panic!("出现错误，请重试"),
        }

        let auto_launch_options = vec![
            "是",
            "否",
        ];

        let auto_launch_ans = Select::new("是否开机自启", auto_launch_options.clone()).with_help_message("↑↓ 移动, 回车确定 ✅, 输入以筛选")
            .prompt();

        match auto_launch_ans {
            Ok(choice) => {
                if choice == auto_launch_options[0] { config.set_auto_launch(true) } else {
                    config.set_auto_launch(false)
                }
            },
            Err(_) => panic!("出现错误，请重试"),
        }

        println!("==============================");
        println!("请确认如下设置");
        println!(" ");

        println!("端口号: {}", config.get_port());
        println!("镜像仓库: {}", if config.get_is_github_download() {
            mirror_repository_options[0]
        } else {
            mirror_repository_options[1]
        });
        println!("开机自启: {}", if config.get_auto_launch() {
            auto_launch_options[0]
        } else {
            auto_launch_options[1]
        });

        println!(" ");
        println!("输入任意键以继续安装, 取消安装请输入 Ctrl+C");

        stdin().read_line(&mut String::new()).expect("error: unable to read user input");
        println!("确认完毕, 开始安装");
        println!("==============================");
}
