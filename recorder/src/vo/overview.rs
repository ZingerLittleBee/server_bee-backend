use crate::vo::cpu::CpuInfoVo;
use crate::vo::disk::DiskIOVo;
use crate::vo::formator::Convert;
use crate::vo::memory::MemUsageVo;
use crate::vo::network::NetworkIOVo;
use crate::vo::usage::UsageVo;
use crate::vo::user::UserVo;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct OverviewVo {
    pub load_avg: Vec<f64>,
    pub cpu_usage: String,
    pub memory_usage: MemUsageVo,
    pub disk_usage: UsageVo,
    pub disk_io: DiskIOVo,
    pub network_io: NetworkIOVo,
}

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct OsOverviewVo {
    pub name: String,
    pub kernel_version: String,
    pub os_version: String,
    pub hostname: String,
    pub cpu_info: CpuInfoVo,
    pub users: Vec<UserVo>,
    pub boot_time: u64,
}
