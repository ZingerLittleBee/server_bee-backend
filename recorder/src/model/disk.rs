use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug, Clone, Copy)]
pub struct DiskIO {
    pub read: u64,
    pub total_read: u64,
    pub write: u64,
    pub total_write: u64,
}

#[derive(Deserialize, Serialize, Default, Debug, Clone, Copy)]
pub struct SectorIncrease {
    pub read: usize,
    pub write: usize,
}

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct DiskDetail {
    pub disk_type: String,
    pub device_name: String,
    pub file_system: String,
    pub total_space: u64,
    pub available_space: u64,
    pub is_removable: bool,
}
