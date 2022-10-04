use std::fs::File;
use anyhow::Result;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, PartialEq, Debug)]
struct Config {
    server: Port
}

impl Default for Config {
    fn default() -> Self {
        Config {
            server: Port {
                port: 8080,
            }
        }
    }
}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
struct Port {
    port: u16
}

fn get_config_yml() -> Result<Config> {
    let config_file = File::open("config.yml")?;
    Ok(serde_yaml::from_reader::<File, Config>(config_file)?)
}

pub fn get_server_port() -> u16 {
    let d = get_config_yml().unwrap_or_default();
    d.server.port
}