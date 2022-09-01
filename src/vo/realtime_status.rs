use crate::vo::cpu::CpuUsageVo;
use crate::vo::disk::DiskDetailVo;
use crate::vo::network::NetworkDetailVo;
use serde::{Deserialize, Serialize};
use crate::model::realtime_status::RealtimeStatus;
use crate::vo::formator::Convert;
use crate::vo::process::ProcessVo;

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct RealtimeStatusVo {
    pub cpu: Vec<CpuUsageVo>,
    pub load_avg: Vec<f64>,
    pub process: Vec<ProcessVo>,
    pub network: Vec<NetworkDetailVo>,
    pub disk: Vec<DiskDetailVo>,
    pub uptime: Vec<u64>,
}

impl Convert<RealtimeStatusVo> for RealtimeStatus {
    fn convert(&self) -> RealtimeStatusVo {
        RealtimeStatusVo {
            cpu: self.cpu.iter().map(|cpu| cpu.convert()).collect(),
            load_avg: self.load_avg.clone(),
            process: self.process.iter().map(|process| process.convert()).collect(),
            network: self.network.iter().map(|network| network.convert()).collect(),
            disk: self.disk.iter().map(|disk| disk.convert()).collect(),
            uptime: self.uptime.clone(),
        }
    }
}