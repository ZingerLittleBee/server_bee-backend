use anyhow::Result;
use daemonize::Daemonize;
use std::borrow::BorrowMut;
use std::path::Path;
use std::process::Command;
use std::{env, fs, io};
use std::fs::File;
use tokio::io::AsyncWriteExt;

#[tokio::main]
async fn main() -> Result<()> {

    let mut response = reqwest::Client::new()
        .get(url()?)
        .send()
        .await?;

    if response.status().as_u16() >= 400 {
        println!("{}, download failed", response.status());
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

fn url() -> Result<String> {
    let base_url = "https://cdn.jsdelivr.net/gh/ZingerLittleBee/server_bee-backend@release/release";
    let version = env!("CARGO_PKG_VERSION");

    let path = Path::new(base_url).join(version).join(get_filename());
    let url = path.to_str().unwrap();
    println!("download url: {}", url);
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
            let mut outfile = fs::File::create(&outpath).unwrap();
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

fn create_daemon() {
    let stdout = File::create("/tmp/serverbee-web.out").unwrap();
    let stderr = File::create("/tmp/serverbee-web.err").unwrap();

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