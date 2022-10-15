mod cli;
mod config;

use crate::cli::{Port, WebConfig};
use crate::config::Config;
use anyhow::Result;
use clap::Parser;
use cli::Args;
use std::borrow::BorrowMut;
use std::fs::File;
use std::io::stdin;
use std::process::Command;
use std::{fs, io};
use tokio::io::AsyncWriteExt;

#[tokio::main]
async fn main() -> Result<()> {
    let args = Args::parse();
    let config = Config::new();

    if args.release.is_some() {
        config.set_version(args.release.unwrap().as_str());
    }

    if args.port.is_some() {
        config.set_port(Port::new(args.port.unwrap()));
    }

    let mut response = reqwest::Client::new()
        .get(config.url().to_str().unwrap())
        .send()
        .await?;
    println!("正在下载 {}", config.url().display());

    if response.status().as_u16() >= 400 {
        println!("文件下载失败 {}", response.status());
        return Ok(());
    }

    let web_file_path = config.web_bin_zip_path();
    println!("下载文件路径: {}", web_file_path.display());

    let mut file = tokio::fs::File::create(&web_file_path).await?;

    while let Some(mut item) = response.chunk().await? {
        file.write_all_buf(item.borrow_mut()).await?;
    }
    println!("文件 {} 下载成功, 正在解压", web_file_path.display());

    let tokio_file = tokio::fs::File::open(web_file_path).await?;
    let std_file = tokio_file.into_std().await;

    unzip(std_file);
    println!("文件解压完毕");

    config.set_auto_launch(!args.auto_launch);

    start_process(Config::web_bin_path().to_str().unwrap());

    println!("按回车键退出...");
    stdin()
        .read_line(&mut String::new())
        .expect("Failed to read line");

    Ok(())
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

#[cfg(windows)]
fn start_process(bin_full_path: &str) {
    Command::new("powershell")
        .args(["/C", bin_full_path])
        .spawn()
        .expect("运行 serverbee-web.exe 失败, 请尝试手动运行");
}

#[cfg(not(windows))]
fn start_process(bin_full_path: &str) {
    println!(
        "文件全路径: {}",
        bin_full_path
    );

    let cmd = format!(
        "nohup {} > serverbee-web.log &",
        bin_full_path
    );

    Command::new("sh")
        .args(["-c", cmd.as_str()])
        .spawn()
        .expect("运行 serverbee-web 失败, 请尝试手动运行");

    let out = Command::new("cat").arg("serverbee-web.log").output();

    thread::sleep(Duration::from_secs(1));
    println!("启动日志: {:?}", out.unwrap());
    println!("完整日志请查看 serverbee-web.log 文件");
}
