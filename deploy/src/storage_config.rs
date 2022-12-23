use std::fs::{File, OpenOptions};
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::cli::Port;
use crate::config::Config;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct StorageConfig {
    pub port: Option<Port>,
    pub version: Option<String>,
    pub is_auto_launch: Option<bool>,
}

impl StorageConfig {
    pub fn new() -> Self {
        if StorageConfig::deploy_config_path().exists() {
            let config = StorageConfig::load_config();
            config
        } else {
            Self {
                port: None,
                version: Some(env!("CARGO_PKG_VERSION").into()),
                is_auto_launch: None,
            }
        }
    }

    pub fn get_version(&self) -> String {
        self.version.clone().unwrap()
    }

    pub fn load_config() -> Self {
        let config_file = File::open(StorageConfig::deploy_config_path()).unwrap();
        let config: StorageConfig = serde_json::from_reader(config_file).unwrap();
        config
    }

    pub fn save_config(&self) {
        let config_file = OpenOptions::new()
            .write(true)
            .create(true)
            .open(StorageConfig::deploy_config_path())
            .unwrap();
        serde_json::to_writer_pretty(config_file, self).unwrap();
    }

    pub fn deploy_config_path() -> PathBuf {
        let mut path = Config::current_dir();
        path.push("deploy.yml");
        path
    }
}
