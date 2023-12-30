use serde::{Deserialize, Serialize};
use sysinfo::{PidExt, Process as SysProcess, ProcessExt};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct SimpleProcess {
    pub name: String,

    pub pid: u32,

    pub parent_id: Option<u32>,

    pub cpu_usage: f32,

    pub memory: u64,
}

impl From<&SysProcess> for SimpleProcess {
    fn from(pro: &SysProcess) -> Self {
        SimpleProcess {
            name: pro.name().to_string(),
            pid: pro.pid().as_u32(),
            memory: pro.memory(),
            cpu_usage: pro.cpu_usage(),
            parent_id: pro.parent().map(|p| p.as_u32()),
        }
    }
}
