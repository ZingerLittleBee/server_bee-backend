use serde::{Deserialize, Serialize};
use sysinfo::DiskUsage as SysDiskUsage;
use sysinfo::{Disk, DiskExt, DiskType};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct DiskIO {
    pub read: u64,
    pub total_read: u64,
    pub write: u64,
    pub total_write: u64,
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct DiskUsage {
    pub total_written_bytes: u64,
    pub written_bytes: u64,
    pub total_read_bytes: u64,
    pub read_bytes: u64,
}

#[derive(Deserialize, Serialize, Default, Debug, Clone, Copy)]
pub struct SectorIncrease {
    read: usize,
    write: usize,
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

impl From<SysDiskUsage> for DiskUsage {
    fn from(disk: SysDiskUsage) -> Self {
        DiskUsage {
            total_written_bytes: disk.total_written_bytes,
            written_bytes: disk.written_bytes,
            total_read_bytes: disk.total_read_bytes,
            read_bytes: disk.read_bytes,
        }
    }
}

impl From<&Disk> for DiskDetail {
    fn from(disk: &Disk) -> Self {
        DiskDetail {
            disk_type: match disk.type_() {
                DiskType::HDD => "HDD".to_string(),
                DiskType::SSD => "SSD".to_string(),
                DiskType::Unknown(_) => "Unknown".to_string(),
            },
            device_name: disk.name().to_str().unwrap_or_default().to_string(),
            file_system: String::from_utf8(disk.file_system().to_vec()).unwrap_or_default(),
            total_space: disk.total_space(),
            available_space: disk.available_space(),
            is_removable: disk.is_removable(),
        }
    }
}
