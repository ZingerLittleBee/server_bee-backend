use crate::model::overview::Overview;
use crate::vo::disk::{DiskIOFormat, DiskUsageVo};
use crate::vo::formator::Convert;
use crate::vo::memory::MemUsageVo;
use crate::vo::network::NetworkIOVo;
use serde::{Deserialize, Serialize};
use crate::model::cpu::CpuInfo;

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct OverviewVo {
    pub cpu_usage: String,
    pub memory_usage: MemUsageVo,
    pub disk_usage: DiskUsageVo,
    pub disk_io: DiskIOFormat,
    pub network_io: NetworkIOVo,
}

impl Convert<OverviewVo> for Overview {
    fn convert(&self) -> OverviewVo {
        OverviewVo {
            cpu_usage: format!("{:.1}", self.cpu_usage),
            memory_usage: self.memory_usage.convert(),
            disk_usage: self.disk_usage.convert(),
            disk_io: self.disk_io.convert(),
            network_io: self.network_io.convert(),
        }
    }
}

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct OsOverview {
    pub name: String,
    pub kernel_version: String,
    pub os_version: String,
    pub hostname: String,
    pub cpu_info: CpuInfoVo,
    pub users: Vec<UserVo>,
    pub boot_time: u64,
}
