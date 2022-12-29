#![cfg_attr(feature = "subsystem", windows_subsystem = "windows")]

extern crate core;

mod cli;
mod config;
mod storage_config;

use crate::cli::Port;
use crate::config::Config;
use anyhow::Result;
use clap::Parser;
use cli::Args;
use std::borrow::BorrowMut;
use std::fs::File;
use std::process::Command;
use std::{fs, io};
use std::path::{Path, PathBuf};
use log::{info, warn};
use tokio::io::AsyncWriteExt;

#[tokio::main]
async fn main() -> Result<()> {

    Config::init_logging();

    let args = Args::parse();

    let mut config = Config::new();

    if args.domestic_download {
        config.set_is_github_download(false);
    }

    if args.foreign_download {
        config.set_is_github_download(true);
    }

    // get latest version
    let latest_version = reqwest::get("https://data.jsdelivr.com/v1/package/gh/ZingerLittleBee/server_bee-backend")
        .await?
        .json::<serde_json::Value>()
        .await?;

    if let Some(version_value) = latest_version.get("versions") {
        if let Some(version_vec) = version_value.as_array() {
            if let Some(version) = version_vec.first() {
                if let Some(version_str) = version.as_str() {
                    info!("latest version: {}", version_str);
                    config.set_version(version_str);
                }
            }
        }
    }

    if args.port.is_some() {
        config.set_port(Port::new(args.port.unwrap()));
    }

    if !Path::new(config.web_bin_path().as_path().to_str().unwrap()).exists() {
        let mut response = reqwest::Client::new()
            .get(config.bin_zip_url().to_str().unwrap())
            .send()
            .await?;
        info!("正在下载 {}", config.bin_zip_url().display());

        if response.status().as_u16() >= 400 {
            warn!("文件下载失败 {}", response.status());
            return Ok(());
        }

        let web_file_path = config.web_bin_zip_path();

        if let Some(p) = web_file_path.parent() {
            if !p.exists() {
                fs::create_dir_all(&p).unwrap();
            }
        }

        info!("文件存放路径: {}", web_file_path.display());

        let mut file = tokio::fs::File::create(&web_file_path).await?;

        while let Some(mut item) = response.chunk().await? {
            file.write_all_buf(item.borrow_mut()).await?;
        }
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
            info!("File {} extracted to \"{}\"", i, outpath.display());
            fs::create_dir_all(&outpath).unwrap();
        } else {
            info!(
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
fn start_process(bin_full_path: &str, port: u16) {

    info!(
        "文件全路径: {}",
        bin_full_path
    );

    Command::new("powershell")
        .args(["/C", bin_full_path])
        .args(["-p", port.to_string()])
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
