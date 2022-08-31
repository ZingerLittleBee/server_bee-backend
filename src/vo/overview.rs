use crate::model::overview::Overview;
use crate::vo::disk::{DiskIOFormat, DiskUsageVo};
use crate::vo::formator::Convert;
use crate::vo::memory::MemUsageVo;
use crate::vo::network::NetworkIOVo;
use serde::{Deserialize, Serialize};

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
