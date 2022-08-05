use sysinfo::{CpuExt, DiskExt, DiskType, NetworkExt, NetworksExt, System, SystemExt};
use serde::{Serialize,Deserialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct Overview {
    pub cpu_usage: f32,
    pub memory_usage: Usage,
    pub disk_usage: Usage,
    pub disk_io: DiskUsage,
    pub network_io: NetworkUsage,
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct Usage {
    pub total: u64,
    pub used: u64,
    pub free: u64,
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct DiskUsage {
    pub read: u64,
    pub total_read: u64,
    pub write: u64,
    pub total_write: u64,
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct NetworkUsage {
    pub received: u64,
    pub total_received: u64,
    pub transmitted: u64,
    pub total_transmitted: u64,
}

pub struct SystemInfo(System);

impl SystemInfo {
    pub fn new() -> Self {
        SystemInfo(System::new_all())
    }

    pub fn get_cpu_usage(&mut self) -> f32 {
        self.0.refresh_cpu();
        self.0.global_cpu_info().cpu_usage()
    }

    pub fn get_mem_usage(&mut self) -> Usage {
        self.0.refresh_memory();
        Usage {
            total: self.0.total_memory(),
            used: self.0.used_memory(),
            free: self.0.total_memory() - self.0.used_memory(),
        }
    }

    pub fn get_disk_usage(&mut self) -> Usage  {
        self.0.refresh_disks();
        let mut disk_usage: Usage = Default::default();
        for disk in self.0.disks() {
            match disk.type_() {
                DiskType::HDD => {},
                DiskType::SSD => {},
                _ => continue
            }
            disk_usage.free += disk.available_space();
            disk_usage.used += disk.total_space() - disk.available_space();
            disk_usage.total += disk.total_space();
        }
        disk_usage
    }

    pub fn get_network_io(&mut self) -> NetworkUsage {
        self.0.refresh_networks();
        let mut network_io: NetworkUsage = Default::default();
        for (_, data) in self.0.networks().iter() {
            network_io.received += data.received();
            network_io.total_received += data.total_received();
            network_io.transmitted += data.transmitted();
            network_io.total_transmitted += data.total_transmitted();
        }
        network_io
    }

    pub fn get_overview(&mut self) -> Overview {
        // TODO
        let disk_io: DiskUsage = Default::default();
        Overview {
            cpu_usage: self.get_cpu_usage(),
            memory_usage: self.get_mem_usage(),
            network_io: self.get_network_io(),
            disk_usage: self.get_disk_usage(),
            disk_io
        }
    }
}