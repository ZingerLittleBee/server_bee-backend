use clap::Parser;
use serde::{Deserialize, Serialize};

/// Serverbee-Backend Configuration
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
    /// Port of Serverbee-Backend
    #[clap(short, long)]
    pub port: Option<u16>,

    /// Version of Serverbee-Backend
    #[clap(short, long)]
    pub release: Option<String>,
}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
pub struct Config {
    server: Port
}

impl Config {
    pub fn new(port: u16) -> Self {
        Config {
            server: Port {
                port
            }
        }
    }
}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
struct Port {
    port: u16
}