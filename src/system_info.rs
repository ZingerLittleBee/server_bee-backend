use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
};

use serde::{Deserialize, Serialize};
use sysinfo::{CpuExt, DiskExt, DiskType, NetworkExt, NetworksExt, System, SystemExt};
use systemstat::{Platform, System as Systemstat};

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

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct SectorIncrease {
    read: usize,
    write: usize,
}

pub struct SystemInfo {
    sys: System,
    #[cfg(target_os = "linux")]
    sector_size_map: HashMap<String, u16>,
    #[cfg(target_os = "linux")]
    sector_increase_map: Arc<RwLock<HashMap<String, SectorIncrease>>>,
}

impl SystemInfo {
    pub fn new() -> Self {
        #[cfg(target_os = "linux")]
        let sector_increase_map = Arc::new(RwLock::new(HashMap::new()));
        #[cfg(target_os = "linux")]
        SystemInfo::sector_thread(sector_increase_map.clone());
        SystemInfo {
            sys: System::new_all(),
            #[cfg(target_os = "linux")]
            sector_size_map: SystemInfo::init_sector_size(),
            #[cfg(target_os = "linux")]
            sector_increase_map,
        }
    }

    #[cfg(target_os = "linux")]
    fn sector_thread(sector_increase_map: Arc<RwLock<HashMap<String, SectorIncrease>>>) {
        use std::thread;

        thread::spawn(move || {
            let systemstat = Systemstat::new();
            let mut prev_sector_increase = SectorIncrease::default();
            loop {
                let mut map = sector_increase_map.write().unwrap();
                systemstat
                    .block_device_statistics()
                    .unwrap()
                    .values()
                    .for_each(|x| {
                        let mut new_sector_increase = SectorIncrease::default();
                        if let Some(_) = map.get_mut(&x.name) {
                            new_sector_increase.read =
                                x.read_sectors.wrapping_sub(prev_sector_increase.read);
                            new_sector_increase.write =
                                x.write_sectors.wrapping_sub(prev_sector_increase.write);
                            // println!(
                            //     "prev: {:#?}, new_sector_increase: {:#?}",
                            //     prev_sector_increase, new_sector_increase
                            // );
                        } else {
                            map.insert(x.name.clone(), SectorIncrease { read: 0, write: 0 });
                        }
                        prev_sector_increase.read = x.read_sectors;
                        prev_sector_increase.write = x.write_sectors;
                        map.insert(x.name.clone(), new_sector_increase);
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

    pub fn get_network_io(&mut self) -> NetworkUsage {
        self.sys.refresh_networks();
        let mut network_io: NetworkUsage = Default::default();
        for (_, data) in self.sys.networks().iter() {
            network_io.received += data.received();
            network_io.total_received += data.total_received();
            network_io.transmitted += data.transmitted();
            network_io.total_transmitted += data.total_transmitted();
        }
        network_io
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
    pub fn get_disk_io() -> DiskUsage {
        Default::default()
    }

    #[cfg(target_os = "linux")]
    pub fn get_disk_io(&self) -> DiskUsage {
        println!("map: {:#?}", self.sector_size_map);
        println!("map: {:#?}", self.sector_increase_map.read().unwrap());
        Default::default()
    }

    pub fn get_overview(&mut self) -> Overview {
        // TODO
        let disk_io: DiskUsage = Default::default();
        Overview {
            cpu_usage: self.get_cpu_usage(),
            memory_usage: self.get_mem_usage(),
            network_io: self.get_network_io(),
            disk_usage: self.get_disk_usage(),
            disk_io,
        }
    }
}
