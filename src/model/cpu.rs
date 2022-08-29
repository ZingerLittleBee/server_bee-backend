use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct CpuInfo {
    pub core_num: usize,
    pub brand: String,
    pub frequency: String,
    pub vendor_id: String,
}

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct CpuStat {
    pub total_usage: String,
    pub cpu_usage: Vec<CpuUsage>,
}

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct CpuUsage {
    pub name: String,
    pub cpu_usage: String,
}
