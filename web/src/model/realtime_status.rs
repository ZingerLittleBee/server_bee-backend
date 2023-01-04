use crate::model::cpu::CpuUsage;
use crate::model::disk::DiskDetail;
use crate::model::network::NetworkDetail;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct RealtimeStatus {
    pub cpu: Vec<CpuUsage>,
    pub network: Vec<NetworkDetail>,
    pub disk: Vec<DiskDetail>,
    pub uptime: Vec<u64>,
}
