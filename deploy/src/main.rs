#![cfg_attr(feature = "subsystem", windows_subsystem = "windows")]

mod cli;
mod config;
mod constant;
mod storage_config;

use crate::cli::Port;
use crate::config::Config;
use anyhow::Result;
use clap::Parser;
use cli::Args;
use inquire::validator::{ErrorMessage, Validation};
use inquire::{Select, Text};
use log::info;
use port_selector::is_free;
use std::fs::File;
use std::io::stdin;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::{fs, io};

#[macro_use]
extern crate rust_i18n;

i18n!("locales");

#[tokio::main]
async fn main() -> Result<()> {
    let args = Args::parse();

    let mut config = Config::new();

    if config.get_interactive() || args.interactive {
        config.set_interactive(true);
        interactive_install(&mut config);
    } else {
        rust_i18n::set_locale(config.get_locale().as_str());
    }

    Config::init_logging();

    if args.port.is_some() {
        config.set_port(Port::new(args.port.unwrap()));
    }

    let latest_version = Config::get_latest_version().await?;
    info!("{}: {}", t!("latest_version"), latest_version);
    config.set_version(latest_version);

    if !Path::new(config.web_bin_path().as_path().to_str().unwrap()).exists() {
        let web_file_path = config.web_bin_zip_path();

        if let Some(p) = web_file_path.parent() {
            if !p.exists() {
                fs::create_dir_all(p).unwrap();
            }
        }

        config.download_bin().await?;

        info!(
            "{}",
            t!("download_and_unzip", path = web_file_path.display())
        );

        let tokio_file = tokio::fs::File::open(web_file_path).await?;
        let std_file = tokio_file.into_std().await;

        unzip(std_file, config.web_bin_dir());
        info!("{}", t!("unzip_success"));
    } else {
        info!("{}", t!("skip_download"));
    }

    config.set_auto_launch(args.auto_launch.unwrap_or_else(|| config.get_auto_launch()));

    start_process(config.web_bin_path().to_str().unwrap(), config.get_port());

    if config.get_interactive() {
        config.set_interactive(false);

        // println!("安装结束, 按任意键退出...");

        // stdin().read_line(&mut String::new()).expect("");
    }

    #[cfg(target_os = "linux")]
    if config.get_auto_launch() {
        use std::env::current_exe;
        println!("{}", t!("auto_launch_tips"));

        println!("############################################");

        match current_exe() {
            Ok(p) => println!("{}", daemon_content(p.display().to_string())),
            Err(_) => println!("{}", daemon_content(t!("deploy_full_path"))),
        }

        println!("systemctl enable serverbee-deploy.service");

        println!("############################################");
    }
    println!("{}", t!("install_finish"));

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
            info!("{}", t!("file_extracted", path = outpath.display()));
            fs::create_dir_all(&outpath).unwrap();
        } else {
            info!(
                "{}",
                t!(
                    "file_extracted_with_size",
                    path = outpath.display(),
                    size = file.size()
                ),
            );
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p).unwrap();
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
    info!("{}: {}", t!("full_path"), bin_full_path);

    Command::new("powershell")
        .args(["/C", bin_full_path])
        .args(["-p", port.to_string().as_str()])
        .spawn()
        .expect(t!("run_fail", path = "serverbee-web.exe").as_str());

    info!("{}", t!("run_success"));
}

#[cfg(not(windows))]
fn start_process(bin_full_path: &str, port: u16) {
    info!("{}: {}", t!("full_path"), bin_full_path);

    Command::new(bin_full_path)
        .arg("-p")
        .arg(port.to_string())
        .spawn()
        .unwrap_or_else(|_| panic!("{}", t!("run_fail", path = bin_full_path)));

    info!("{}", t!("run_success"));
}

fn interactive_install(config: &mut Config) {
    let locales_options = vec!["English", "中文"];

    let locales_ans = Select::new(t!("locale_question").as_str(), locales_options.clone())
        .with_help_message(t!("action_tips").as_str())
        .prompt();

    match locales_ans {
        Ok(choice) => match choice {
            "English" => config.set_locale("en".to_string()),
            "中文" => config.set_locale("zh".to_string()),
            _ => panic!("{}", t!("error_and_retry")),
        },
        Err(_) => panic!("{}", t!("error_and_retry")),
    }
    rust_i18n::set_locale(config.get_locale().as_str());

    let port_ans = Text::new(t!("port_question").as_str())
        .with_validator(|s: &str| {
            let port;
            if let Ok(p) = s.parse::<u16>() {
                port = p;
            } else if s.is_empty() {
                port = 9527
            } else {
                return Ok(Validation::Invalid(ErrorMessage::from(t!("port_invalid"))));
            }
            if !is_free(port) {
                return Ok(Validation::Invalid(ErrorMessage::from(t!(
                    "port_in_use",
                    port = port
                ))));
            }
            Ok(Validation::Valid)
        })
        .prompt();

    match port_ans {
        Ok(port) => config.set_port(Port::new(port.parse::<u16>().unwrap_or(9527))),
        Err(_) => panic!("{}", t!("error_and_retry")),
    }

    let auto_launch_options = vec![t!("yes"), t!("no")];

    let auto_launch_ans = Select::new(t!("launch_question").as_str(), auto_launch_options.clone())
        .with_help_message(t!("action_tips").as_str())
        .prompt();

    match auto_launch_ans {
        Ok(choice) => {
            if choice == auto_launch_options[0] {
                config.set_auto_launch(true)
            } else {
                config.set_auto_launch(false)
            }
        }
        Err(_) => panic!("{}", t!("error_and_retry")),
    }

    println!("==============================");
    println!("{}", t!("confirm_config"));
    println!(" ");
    println!("{}: {}", t!("port"), config.get_port());
    println!(
        "{}: {}",
        t!("auto_launch"),
        if config.get_auto_launch() {
            auto_launch_options[0].clone()
        } else {
            auto_launch_options[1].clone()
        }
    );

    println!(" ");
    println!("{}", t!("install_confirm"));

    stdin()
        .read_line(&mut String::new())
        .expect("error: unable to read user input");
    println!("{}", t!("start_install"));
    println!("==============================");
}

#[cfg(target_os = "linux")]
fn daemon_content(path: String) -> String {
    format!(
        r#"
cat > /etc/systemd/system/serverbee-deploy.service <<EOF
[Unit]
Description=ServerBee Deploy
After=network-online.target systemd-resolved.service
Wants=network-online.target systemd-resolved.service

[Service]
Type=oneshot
ExecStart={}
RemainAfterExit=yes
Environment="RUST_LOG=info"

[Install]
WantedBy=multi-user.target
EOF
"#,
        path
    )
}
