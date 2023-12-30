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

    pub children: Option<Vec<String>>, // pub group_id: Option<String>,
}
