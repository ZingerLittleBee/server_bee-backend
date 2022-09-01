#[cfg(target_os = "linux")]
use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
};
#[cfg(target_os = "linux")]
use systemstat::{Platform, System as Systemstat};

use crate::model::cpu::{CpuInfo, CpuUsage};
use crate::model::disk::{DiskDetail, DiskIO};
use crate::model::network::{NetworkDetail, NetworkIO};
use crate::model::overview::{OsOverview, Overview};
use crate::model::process::Process;
use crate::model::usage::Usage;
use crate::model::user::User;
use sysinfo::{CpuExt, DiskExt, DiskType, NetworkExt, NetworksExt, System, SystemExt, UserExt};

pub struct SystemInfo {
    sys: System,
    #[cfg(target_os = "linux")]
    sector_size_map: HashMap<String, u16>,
    #[cfg(target_os = "linux")]
    disk_usage_map: Arc<RwLock<HashMap<String, DiskIO>>>,
}

impl SystemInfo {
    pub fn new() -> Self {
        #[cfg(target_os = "linux")]
        let disk_usage_map = Arc::new(RwLock::new(HashMap::<String, DiskIO>::new()));
        #[cfg(target_os = "linux")]
        SystemInfo::sector_thread(disk_usage_map.clone());
        SystemInfo {
            sys: System::new_all(),
            #[cfg(target_os = "linux")]
            sector_size_map: SystemInfo::init_sector_size(),
            #[cfg(target_os = "linux")]
            disk_usage_map,
        }
    }

    #[cfg(target_os = "linux")]
    fn sector_thread(disk_usage_map: Arc<RwLock<HashMap<String, DiskIO>>>) {
        use std::thread;

        thread::spawn(move || {
            let systemstat = Systemstat::new();
            loop {
                let mut map = disk_usage_map.write().unwrap();
                systemstat
                    .block_device_statistics()
                    .unwrap()
                    .values()
                    .for_each(|x| {
                        let mut sector_increase = SectorIncrease::default();
                        if let Some(disk_usage) = map.get_mut(&x.name) {
                            sector_increase.read =
                                x.read_sectors.wrapping_sub(disk_usage.total_read as usize);
                            sector_increase.write = x
                                .write_sectors
                                .wrapping_sub(disk_usage.total_write as usize);
                        }
                        map.insert(
                            x.name.clone(),
                            DiskIO {
                                read: sector_increase.read as u64,
                                write: sector_increase.write as u64,
                                total_read: x.read_sectors as u64,
                                total_write: x.write_sectors as u64,
                            },
                        );
                    });
                thread::sleep(std::time::Duration::from_secs(1));
            }
        });
    }

    pub fn get_cpu_usage(&mut self) -> f32 {
        self.sys.refresh_cpu();
        self.sys.global_cpu_info().cpu_usage()
    }

    pub fn get_mem_usage(&mut self) -> Usage {
        self.sys.refresh_memory();
        Usage {
            total: self.sys.total_memory(),
            used: self.sys.used_memory(),
            free: self.sys.total_memory() - self.sys.used_memory(),
        }
    }

    pub fn get_disk_usage(&mut self) -> Usage {
        self.sys.refresh_disks();
        let mut disk_usage: Usage = Default::default();
        for disk in self.sys.disks() {
            match disk.type_() {
                DiskType::HDD => {}
                DiskType::SSD => {}
                _ => continue,
            }
            disk_usage.free += disk.available_space();
            disk_usage.used += disk.total_space() - disk.available_space();
            disk_usage.total += disk.total_space();
        }
        disk_usage
    }

    pub fn get_network_io(&mut self) -> NetworkIO {
        self.sys.refresh_networks();
        let mut network_io: NetworkIO = Default::default();
        for (_, data) in self.sys.networks().iter() {
            network_io.received += data.received();
            network_io.total_received += data.total_received();
            network_io.transmitted += data.transmitted();
            network_io.total_transmitted += data.total_transmitted();
        }
        network_io
    }

    pub fn get_boot_time(&mut self) -> u64 {
        self.sys.boot_time()
    }

    pub fn get_uptime(&mut self) -> Vec<u64> {
        let mut uptime = self.sys.uptime();
        let days = uptime / 86400;
        uptime -= days * 86400;
        let hours = uptime / 3600;
        uptime -= hours * 3600;
        let minutes = uptime / 60;
        vec![days, hours, minutes]
    }

    pub fn get_load_avg(&mut self) -> Vec<f64> {
        let load_avg = self.sys.load_average();
        vec![load_avg.one, load_avg.five, load_avg.fifteen]
    }

    #[cfg(target_os = "linux")]
    fn init_sector_size() -> HashMap<String, u16> {
        use std::{
            fs::{read_dir, File},
            io::Read,
        };
        let mut map = HashMap::new();
        let block_paths = read_dir("/sys/block").unwrap();
        for path in block_paths {
            let path = path.unwrap().path();
            let mut file = File::open(path.join("queue/hw_sector_size")).unwrap();
            let mut sector_size = String::new();
            file.read_to_string(&mut sector_size).unwrap();
            map.insert(
                path.file_name().unwrap().to_str().unwrap().to_string(),
                sector_size.trim().parse::<u16>().unwrap(),
            );
        }
        map
    }

    #[cfg(not(target_os = "linux"))]
    pub fn get_disk_io(&self) -> DiskIO {
        Default::default()
    }

    #[cfg(target_os = "linux")]
    pub fn get_disk_io(&self) -> DiskIO {
        let mut total_disk_usage: DiskIO = Default::default();
        let map = self.disk_usage_map.read().unwrap();
        map.iter().for_each(|(key, disk_usage)| {
            let sector_size = *self.sector_size_map.get(key).unwrap_or(&512) as u64;
            total_disk_usage.read += disk_usage.read * sector_size;
            total_disk_usage.write += disk_usage.write * sector_size;
            total_disk_usage.total_read += disk_usage.total_read * sector_size;
            total_disk_usage.total_write += disk_usage.total_write * sector_size;
        });
        total_disk_usage
    }

    pub fn get_overview(&mut self) -> Overview {
        Overview {
            cpu_usage: self.get_cpu_usage(),
            memory_usage: self.get_mem_usage(),
            network_io: self.get_network_io(),
            disk_usage: self.get_disk_usage(),
            disk_io: self.get_disk_io(),
        }
    }

    pub fn get_cpu_info(&mut self) -> CpuInfo {
        self.sys.refresh_cpu();
        CpuInfo {
            core_num: self.sys.physical_core_count().unwrap_or_default(),
            brand: self.sys.cpus()[0].brand().to_string(),
            frequency: self.sys.global_cpu_info().frequency().to_string(),
            vendor_id: self.sys.cpus()[0].vendor_id().to_string(),
        }
    }

    pub fn get_cpu_stat(&mut self) -> Vec<CpuUsage> {
        self.sys.refresh_cpu();
        self.sys
            .cpus()
            .iter()
            .map(|x| CpuUsage {
                name: x.name().to_string(),
                cpu_usage: format!("{}%", x.cpu_usage()),
            })
            .collect()
    }

    pub fn get_disk_detail_usage(&mut self) -> Vec<DiskDetail> {
        self.sys.refresh_disks();
        self.sys.disks().iter().map(|x| x.into()).collect()
    }

    pub fn get_network_detail(&mut self) -> Vec<NetworkDetail> {
        self.sys.refresh_networks();
        NetworkDetail::new_list(self.sys.networks())
    }

    pub fn get_process(&mut self) -> Vec<Process> {
        self.sys.refresh_processes();
        self.sys.processes().iter().map(|x| x.1.into()).collect()
    }

    pub fn get_os_overview(&mut self) -> OsOverview {
        OsOverview {
            name: self.sys.name().unwrap_or_else(|| "<unknown>".to_owned()),
            kernel_version: self
                .sys
                .kernel_version()
                .unwrap_or_else(|| "<unknown>".to_owned()),
            os_version: self
                .sys
                .long_os_version()
                .unwrap_or_else(|| "<unknown>".to_owned()),
            hostname: self
                .sys
                .host_name()
                .unwrap_or_else(|| "<unknown>".to_owned()),
            cpu_info: self.get_cpu_info(),
            users: self
                .sys
                .users()
                .iter()
                .map(|user| User {
                    uid: user.id().to_string(),
                    gid: user.group_id().to_string(),
                    name: user.name().to_string(),
                    groups: user.groups().iter().map(|x| x.to_string()).collect(),
                })
                .collect(),
            boot_time: self.get_boot_time(),
        }
    }
}
