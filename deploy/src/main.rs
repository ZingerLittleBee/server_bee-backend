mod cli;

use cli::Args;
use clap::Parser;
use anyhow::Result;
use std::borrow::BorrowMut;
use std::path::Path;
use std::process::Command;
use std::{env, fs, io};
use std::fs::File;
use auto_launch::AutoLaunchBuilder;
use port_killer::kill_by_pids;
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

    let mut file = tokio::fs::File::create(get_filename()).await?;

    while let Some(mut item) = response.chunk().await? {
        file.write_all_buf(item.borrow_mut()).await?;
    }

    let tokio_file = tokio::fs::File::open(get_filename()).await?;
    let std_file = tokio_file.into_std().await;

    unzip(std_file);

    create_daemon();
    println!("程序后台运行成功");

    set_auto_launch();

    Ok(())
}

fn get_filename() -> &'static str {
    if cfg!(target_os = "macos") {
        "serverbee-x86_64-apple-darwin.zip"
    } else if cfg!(target_os = "linux") {
        "serverbee-x86_64-unknown-linux-musl.zip"
    } else if cfg!(target_os = "windows") {
        "serverbee-x86_64-pc-windows-gnu.zip"
    } else {
        println!("unknown os");
        "serverbee-x86_64-unknown-linux-musl.zip"
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

fn set_auto_launch() {
    let app_name = env!("CARGO_PKG_NAME");
    let current_dir = env::current_dir().unwrap().as_path().join(format!("{}.exe", app_name));
    println!("当前执行目录: {}", current_dir.display());

    let auto = AutoLaunchBuilder::new()
        .set_app_name(app_name)
        .set_app_path(current_dir.to_str().unwrap())
        .set_use_launch_agent(true)
        .build()
        .unwrap();

    if auto.is_enabled().unwrap() {
        println!("已经设置开机启动");
    } else {
        auto.enable().unwrap();
        println!("设置开机启动成功");
    }
    // auto.disable().unwrap();
    // auto.is_enabled().unwrap();
}

#[cfg(windows)]
fn create_daemon() {
    Command::new("powershell")
        .args(["/C", r".\serverbee-web.exe"])
        .spawn().expect("运行 serverbee-web.exe 失败, 请尝试手动运行");
}

#[cfg(not(windows))]
fn create_daemon() {
    use daemonize::Daemonize;

    let stdout = File::create("/tmp/serverbee-web.out").unwrap();
    let stderr = File::create("/tmp/serverbee-web.err").unwrap();

    let pid_path = "/tmp/serverbee-web.pid";

    if Path::new(pid_path).is_file() {
        let pre_pid = fs::read_to_string(pid_path).unwrap().parse::<u32>().unwrap();

        match kill_by_pids(&[pre_pid]) {
            Ok(_) => println!("kill pid: {} success", pre_pid),
            Err(e) => println!("kill pid {} failed: {}", pre_pid, e),
        }

        match fs::remove_file(pid_path) {
            Ok(_) => println!("remove pid file: {}", pid_path),
            Err(_e) => println!("remove {} failed: {}", pid_path, _e)
        }
    }

    let daemonize = Daemonize::new()
        .pid_file("/tmp/serverbee-web.pid")
        .working_directory(env::current_dir().unwrap().to_str().unwrap())
        .stdout(stdout)
        .stderr(stderr)
        .privileged_action(|| {
            Command::new("./serverbee-web")
                .status()
                .expect("failed to execute process")
        });

    match daemonize.start() {
        Ok(_) => println!("Success, daemonized"),
        Err(_e) => eprintln!("Error, {}", _e),
    };
}