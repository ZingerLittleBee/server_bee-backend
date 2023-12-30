use crate::model::disk::DiskIO;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct Process {
    pub name: String,

    /// command
    pub cmd: Vec<String>,

    /// executable path
    pub exe: String,

    pub pid: u32,

    pub environ: Vec<String>,

    /// current working directory
    pub cwd: String,

    pub root: String,

    pub memory: u64,

    pub virtual_memory: u64,

    pub parent: Option<u32>,

    pub status: String,

    pub start_time: u64,

    pub run_time: u64,

    pub cpu_usage: f32,

    pub disk_usage: DiskIO,

    pub user_id: Option<String>,
    // pub group_id: Option<String>,
}
