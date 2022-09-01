use serde::{Deserialize, Serialize};
use crate::model::cpu::{CpuInfo, CpuUsage};
use crate::vo::formator::Convert;

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct CpuInfoVo {
    pub core_num: usize,
    pub brand: String,
    pub frequency: String,
    pub vendor_id: String,
}


#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct CpuUsageVo {
    pub name: String,
    pub cpu_usage: String,
}

impl Convert<CpuUsageVo> for CpuUsage {
    fn convert(&self) -> CpuUsageVo {
        CpuUsageVo {
            name: self.name.clone(),
            cpu_usage: self.cpu_usage.clone(),
        }
    }
}

impl Convert<CpuInfoVo> for CpuInfo {
    fn convert(&self) -> CpuInfoVo {
        CpuInfoVo {
            core_num: self.core_num,
            brand: self.brand.clone(),
            frequency: self.frequency.clone(),
            vendor_id: self.vendor_id.clone(),
        }
    }
}