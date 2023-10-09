use crate::cli::Port;
use crate::config::Config;
use serde::{Deserialize, Serialize};
use std::fs::{File, OpenOptions};
use std::path::PathBuf;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct StorageConfig {
    pub port: Option<u16>,
    pub is_auto_launch: Option<bool>,
    pub locale: Option<String>,
    interactive: Option<bool>,
}

impl StorageConfig {
    pub fn new() -> Self {
        if StorageConfig::deploy_config_path().exists() {
            StorageConfig::load_config()
        } else {
            Self {
                port: None,
                locale: None,
                is_auto_launch: None,
                interactive: None,
            }
        }
    }

    pub fn set_interactive(&mut self, interactive: bool) {
        if self.interactive.is_none() || self.interactive.unwrap() != interactive {
            self.interactive = Some(interactive);
            self.save_config();
        }
    }

    pub fn set_locale(&mut self, locale: String) {
        if self.locale.is_none() || self.locale.as_ref().unwrap() != &locale {
            self.locale = Some(locale);
            self.save_config();
        }
    }

    pub fn get_locale(&self) -> String {
        self.locale.clone().unwrap_or_else(|| "en".to_string())
    }

    pub fn get_interactive(&self) -> Option<bool> {
        self.interactive
    }

    pub fn set_auto_launch(&mut self, is_auto_launch: bool) {
        if self.is_auto_launch.is_none() || self.is_auto_launch.unwrap() != is_auto_launch {
            self.is_auto_launch = Some(is_auto_launch);
            self.save_config();
        }
    }

    pub fn get_auto_launch(&self) -> bool {
        self.is_auto_launch.unwrap_or(true)
    }

    pub fn set_port(&mut self, port: Port) {
        if self.port.is_none() || self.port.unwrap() != port.get_value() {
            self.port = Some(port.get_value());
            self.save_config();
        }
    }

    pub fn load_config() -> Self {
        let config_file = File::open(StorageConfig::deploy_config_path()).unwrap();
        let config: StorageConfig = serde_yaml::from_reader(config_file).unwrap();
        config
    }

    pub fn save_config(&self) {
        let config_file = OpenOptions::new()
            .write(true)
            .create(true)
            .open(StorageConfig::deploy_config_path())
            .unwrap();
        serde_yaml::to_writer(config_file, self).unwrap();
    }

    pub fn deploy_config_path() -> PathBuf {
        let mut path = Config::current_dir();
        path.push("deploy-config.yml");
        path
    }
}
