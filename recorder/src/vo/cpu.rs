use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct CpuInfoVo {
    pub core_num: usize,
    pub brand: String,
    pub frequency: u64,
    pub vendor_id: String,
}

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct CpuUsageVo {
    pub name: String,
    pub usage: f32,
}
