use crate::model::disk::DiskDetail;
use crate::model::memory::MemoryUsage;
use crate::model::network::NetworkInfo;
use crate::model::overview::OsOverview;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct DeviceInfo {
    pub name: String,
    pub hostname: String,
    pub kernel: String,
    pub cup_num: usize,
    pub brand: String,
    pub frequency: u64,
    pub vendor: String,
    pub memory: u64,
    pub swap: u64,
    pub version: String,
    pub disk: Vec<DiskDetail>,
    pub network: Vec<NetworkInfo>,
}

impl DeviceInfo {
    pub fn new(
        os_overview: OsOverview,
        mem: MemoryUsage,
        network_info: Vec<NetworkInfo>,
        disk_detail: Vec<DiskDetail>,
        version: String,
    ) -> DeviceInfo {
        let cpu_info = os_overview.cpu_info;
        DeviceInfo {
            name: os_overview.name,
            hostname: os_overview.hostname,
            kernel: os_overview.kernel_version,
            cup_num: cpu_info.core_num,
            brand: cpu_info.brand,
            frequency: cpu_info.frequency,
            vendor: cpu_info.vendor_id,
            memory: mem.total,
            swap: mem.swap_total,
            version,
            disk: disk_detail,
            network: network_info,
        }
    }
}
