mod cli;

use cli::Args;
use clap::Parser;
use anyhow::Result;
use std::borrow::BorrowMut;
use std::path::Path;
use std::process::Command;
use std::{env, fs, io, thread};
use std::fs::File;
use std::io::stdin;
use std::time::Duration;
use auto_launch::AutoLaunchBuilder;
use tokio::io::AsyncWriteExt;
use crate::cli::Config;

#[tokio::main]
async fn main() -> Result<()> {

    let args = Args::parse();

    if args.port.is_some() {
        let config = Config::new(args.port.unwrap());
        let f = fs::OpenOptions::new()
            .write(true)
            .create(true)
            .open("config.yml")
            .expect("Couldn't open file");
        serde_yaml::to_writer(f, &config).unwrap();
    }

    let url = url(args.release)?;
    println!("正在下载 {}", url.clone());
    let mut response = reqwest::Client::new()
        .get(url)
        .send()
        .await?;

    if response.status().as_u16() >= 400 {
        println!("文件下载失败 {}", response.status());
        return Ok(())
    }

    let file_path = env::current_dir().unwrap().join(get_filename());
    println!("下载文件路径: {}", file_path.display());

    let mut file = tokio::fs::File::create(file_path.clone()).await?;

    while let Some(mut item) = response.chunk().await? {
        file.write_all_buf(item.borrow_mut()).await?;
    }
    println!("文件 {} 下载成功, 正在解压", file_path.display());

    let tokio_file = tokio::fs::File::open(file_path).await?;
    let std_file = tokio_file.into_std().await;

    unzip(std_file);
    println!("文件解压完毕");

    set_auto_launch(!args.auto_launch);

    start_process();

    println!("按回车键退出...");
    stdin()
        .read_line(&mut String::new())
        .expect("Failed to read line");

    Ok(())
}

fn get_filename() -> &'static str {
    if cfg!(target_os = "macos") {
        "serverbee-web-x86_64-apple-darwin.zip"
    } else if cfg!(target_os = "linux") {
        "serverbee-web-x86_64-unknown-linux-musl.zip"
    } else if cfg!(target_os = "windows") {
        "serverbee-web-x86_64-pc-windows-gnu.zip"
    } else {
        println!("unknown os");
        "serverbee-web-x86_64-unknown-linux-musl.zip"
    }
}

fn url(version: Option<String>) -> Result<String> {
    let base_url = "https://cdn.jsdelivr.net/gh/ZingerLittleBee/server_bee-backend@release/release";
    let version = version.unwrap_or_else(|| env!("CARGO_PKG_VERSION").to_string());

    let path = Path::new(base_url).join(version).join(get_filename());
    let url = path.to_str().unwrap();
    Ok(url.to_string())
}

fn unzip(file: File) {
    let mut archive = zip::ZipArchive::new(file).unwrap();

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let outpath = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };

        {
            let comment = file.comment();
            if !comment.is_empty() {
                println!("File {} comment: {}", i, comment);
            }
        }

        if (*file.name()).ends_with('/') {
            println!("File {} extracted to \"{}\"", i, outpath.display());
            fs::create_dir_all(&outpath).unwrap();
        } else {
            println!(
                "File {} extracted to \"{}\" ({} bytes)",
                i,
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

fn set_auto_launch(enable: bool) {
    let app_name = env!("CARGO_PKG_NAME");

    if let Ok(current_dir) = env::current_dir() {
        let full_path= if cfg!(target_os = "windows") {
            current_dir.as_path().join(format!("{}.exe", app_name))
        } else {
             current_dir.as_path().join(app_name)
        };
        println!("自启执行文件: {}", full_path.display());

        let auto = AutoLaunchBuilder::new()
            .set_app_name(app_name)
            .set_app_path(
                full_path.to_str().unwrap())
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
}

#[cfg(windows)]
fn start_process() {
    Command::new("powershell")
        .args(["/C", r".\serverbee-web.exe"])
        .spawn().expect("运行 serverbee-web.exe 失败, 请尝试手动运行");
}

#[cfg(not(windows))]
fn start_process() {
    let full_path = env::current_dir().unwrap().join("serverbee-web");
    println!("文件全路径: {}", env::current_dir().unwrap().join("serverbee-web").display());

    let cmd = format!("nohup {} > serverbee-web.log &", full_path.to_str().unwrap());

    Command::new("sh").args(["-c", cmd.as_str()])
        .spawn().expect("运行 serverbee-web 失败, 请尝试手动运行");

    let out = Command::new("cat").arg(
        "serverbee-web.log")
        .output();

    thread::sleep(Duration::from_secs(1));
    println!("启动日志: {:?}", out.unwrap());
    println!("完整日志请查看 serverbee-web.log 文件");
}