use crate::model::process::Process;
use crate::vo::disk::DiskIOVo;
use crate::vo::formator::Convert;
use serde::{Deserialize, Serialize};

use super::formator::{FormatData, Formator};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct ProcessVo {
    pub name: String,

    /// command
    pub cmd: Vec<String>,

    /// executable path
    pub exe: String,

    pub pid: String,

    pub environ: Vec<String>,

    /// current working directory
    pub cwd: String,

    pub root: String,

    pub memory: FormatData,

    pub vir_mem: FormatData,

    pub parent: Option<String>,

    pub status: String,

    pub start_time: String,

    pub run_time: String,

    pub cpu: String,

    pub disk: DiskIOVo,

    pub user: Option<String>,

    pub children: Option<Vec<String>>

    // pub group_id: Option<String>,
}

impl Convert<ProcessVo> for Process {
    fn convert(&self) -> ProcessVo {
        let formator = Formator::new();
        ProcessVo {
            name: self.name.clone(),
            cmd: self.cmd.clone(),
            exe: self.exe.clone(),
            pid: self.pid.to_string(),
            environ: self.environ.clone(),
            cwd: self.cwd.clone(),
            root: self.root.clone(),
            memory: formator.format_from_byte(self.memory),
            vir_mem: formator.format_from_byte(self.virtual_memory),
            parent: self.parent.map(|p| p.to_string()),
            status: self.status.clone(),
            start_time: self.start_time.to_string(),
            run_time: self.run_time.to_string(),
            cpu: format!("{:.1}", self.cpu_usage),
            disk: self.disk_usage.convert(),
            user: None,
            // group_id: self.group_id.clone(),
            children: None,
        }
    }
}
