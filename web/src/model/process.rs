use crate::model::disk::DiskIO;
use serde::{Deserialize, Serialize};
use sysinfo::Process as SysProcess;

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

impl From<&SysProcess> for Process {
    fn from(pro: &SysProcess) -> Self {
        Process {
            name: pro.name().to_string(),
            cmd: pro.cmd().to_vec(),
            exe: pro
                .exe()
                .map(|p| p.to_str().unwrap_or_default().to_string())
                .unwrap_or_default(),
            pid: pro.pid().as_u32(),
            environ: pro.environ().to_vec(),
            cwd: pro
                .cwd()
                .map(|p| p.to_str().unwrap_or_default().to_string())
                .unwrap_or_default(),
            root: pro
                .root()
                .map(|p| p.to_str().unwrap_or_default().to_string())
                .unwrap_or_default(),
            memory: pro.memory(),
            virtual_memory: pro.virtual_memory(),
            parent: pro.parent().map(|p| p.as_u32()),
            status: pro.status().to_string(),
            start_time: pro.start_time(),
            run_time: pro.run_time(),
            cpu_usage: pro.cpu_usage(),
            disk_usage: DiskIO::from(pro.disk_usage()),
            user_id: pro.user_id().map(|u| u.to_string()),
            // group_id: pro.group_id().map(|g| g.to_string()),
        }
    }
}
