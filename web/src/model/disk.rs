use serde::{Deserialize, Serialize};
use sysinfo::{Disk, DiskKind, DiskUsage};

#[derive(Deserialize, Serialize, Default, Debug, Clone, Copy)]
pub struct DiskIO {
    pub read: u64,
    pub total_read: u64,
    pub write: u64,
    pub total_write: u64,
}

impl From<DiskUsage> for DiskIO {
    fn from(usage: DiskUsage) -> Self {
        DiskIO {
            read: usage.read_bytes,
            total_read: usage.total_read_bytes,
            write: usage.written_bytes,
            total_write: usage.total_written_bytes,
        }
    }
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

impl From<&Disk> for DiskDetail {
    fn from(disk: &Disk) -> Self {
        DiskDetail {
            disk_type: match disk.kind() {
                DiskKind::HDD => "HDD".to_string(),
                DiskKind::SSD => "SSD".to_string(),
                DiskKind::Unknown(_) => "Unknown".to_string(),
            },
            device_name: disk.name().to_str().unwrap_or_default().to_string(),
            file_system: disk
                .file_system()
                .to_str()
                .map(|s| s.to_string())
                .unwrap_or_default(),
            total_space: disk.total_space(),
            available_space: disk.available_space(),
            is_removable: disk.is_removable(),
        }
    }
}
