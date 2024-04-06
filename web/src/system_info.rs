#[cfg(target_os = "linux")]
use std::collections::HashMap;
use std::str::FromStr;
#[cfg(not(target_os = "windows"))]
use systemstat::{Platform, System as Systemstat};

use crate::model::component::ComponentTemperature;
use crate::model::disk::{DiskDetail, DiskIO};
use crate::model::network::{NetworkDetail, NetworkIO};
use crate::model::overview::{OsOverview, Overview};
use crate::model::process::Process;
use crate::model::realtime_status::RealtimeStatus;
use crate::model::simple_process::SimpleProcess;
use crate::model::usage::Usage;
use crate::model::user::User;
use crate::model::{
    cpu::{CpuInfo, CpuUsage},
    memory::MemoryUsage,
};
use crate::server::{Sort, SortBy, SortOrder};
use crate::vo::formator::Convert;
use crate::vo::fusion::Fusion;
use crate::vo::simple_process::SimpleProcessVo;
use sysinfo::{Components, DiskKind, Disks, Networks, System, Uid, Users};

pub struct SystemInfo {
    sys: System,
    networks: Networks,
    disks: Disks,
    components: Components,
    users: Users,
    #[cfg(target_os = "linux")]
    sector_size_map: HashMap<String, u16>,

    #[cfg(target_os = "linux")]
    last_disk_io: DiskIO,

    #[cfg(not(target_os = "windows"))]
    systemstat: Systemstat,
}

impl SystemInfo {
    pub fn new() -> Self {
        SystemInfo {
            sys: System::new_all(),
            networks: Networks::new_with_refreshed_list(),
            disks: Disks::new_with_refreshed_list(),
            components: Components::new_with_refreshed_list(),
            users: Users::new_with_refreshed_list(),
            #[cfg(target_os = "linux")]
            sector_size_map: SystemInfo::init_sector_size(),
            #[cfg(target_os = "linux")]
            last_disk_io: DiskIO::default(),

            #[cfg(not(target_os = "windows"))]
            systemstat: Systemstat::new(),
        }
    }

    pub fn get_cpu_usage(&mut self) -> f32 {
        self.sys.global_cpu_info().cpu_usage()
    }

    #[cfg(target_os = "macos")]
    pub fn get_mem_usage(&mut self) -> MemoryUsage {
        let mut memory_usage = MemoryUsage::default();

        if let Ok(mem) = self.systemstat.memory() {
            let total = mem.total.as_u64();
            let free = mem.free.as_u64();
            let used = total - free;
            memory_usage.total = total;
            memory_usage.used = used;
            memory_usage.free = free;
        }

        if let Ok(swap_mem) = self.systemstat.swap() {
            let total = swap_mem.total.as_u64();
            let free = swap_mem.free.as_u64();
            let used = total - free;
            memory_usage.swap_total = total;
            memory_usage.swap_used = used;
            memory_usage.swap_free = free;
        }
        memory_usage
    }

    #[cfg(not(target_os = "macos"))]
    pub fn get_mem_usage(&mut self) -> MemoryUsage {
        MemoryUsage {
            total: self.sys.total_memory(),
            used: self.sys.used_memory(),
            free: self.sys.free_memory(),
            swap_total: self.sys.total_swap(),
            swap_used: self.sys.used_swap(),
            swap_free: self.sys.free_swap(),
        }
    }

    pub fn get_disk_usage(&mut self) -> Usage {
        let mut disk_usage: Usage = Default::default();
        self.disks.refresh();
        for disk in self.disks.iter() {
            match disk.kind() {
                DiskKind::HDD => {}
                DiskKind::SSD => {}
                _ => continue,
            }
            disk_usage.free += disk.available_space();
            disk_usage.used += disk.total_space() - disk.available_space();
            disk_usage.total += disk.total_space();
        }
        disk_usage
    }

    pub fn get_network_io(&mut self) -> NetworkIO {
        let mut network_io: NetworkIO = Default::default();
        self.networks.refresh();
        for (_, data) in self.networks.iter() {
            network_io.received += data.received();
            network_io.total_received += data.total_received();
            network_io.transmitted += data.transmitted();
            network_io.total_transmitted += data.total_transmitted();
        }
        network_io
    }

    pub fn get_boot_time(&mut self) -> u64 {
        System::boot_time()
    }

    pub fn get_uptime(&mut self) -> Vec<u64> {
        let mut uptime = System::boot_time();
        let days = uptime / 86400;
        uptime -= days * 86400;
        let hours = uptime / 3600;
        uptime -= hours * 3600;
        let minutes = uptime / 60;
        vec![days, hours, minutes]
    }

    /// load average percentage
    pub fn get_load_avg(&mut self) -> Vec<f64> {
        let load_avg = System::load_average();
        let core_num = self.sys.cpus().len() as f64;
        vec![
            load_avg.one / core_num,
            load_avg.five / core_num,
            load_avg.fifteen / core_num,
        ]
    }

    #[cfg(target_os = "linux")]
    fn init_sector_size() -> HashMap<String, u16> {
        use std::{
            fs::{read_dir, File},
            io::Read,
        };
        let mut map = HashMap::new();

        let block_paths;

        let read_block = read_dir("/sys/block");

        if read_block.is_ok() {
            block_paths = read_block.unwrap();
        } else {
            return map;
        }

        for block_path in block_paths {
            let path = block_path.unwrap().path();
            let mut file = if let Ok(file) = File::open(path.join("queue/hw_sector_size")) {
                file
            } else {
                continue;
            };
            let mut sector_size = String::new();
            match file.read_to_string(&mut sector_size) {
                Ok(_) => {}
                Err(_) => continue,
            }
            map.insert(
                path.file_name().unwrap().to_str().unwrap().to_string(),
                sector_size.trim().parse::<u16>().unwrap_or(512),
            );
        }
        map
    }

    #[cfg(not(target_os = "linux"))]
    pub fn get_disk_io(&self) -> DiskIO {
        Default::default()
    }

    #[cfg(target_os = "linux")]
    pub fn get_disk_io(&mut self) -> DiskIO {
        let mut total_read = 0;
        let mut total_write = 0;
        self.systemstat
            .block_device_statistics()
            .unwrap()
            .values()
            .for_each(|x| {
                let sector_size = *self.sector_size_map.get(&x.name).unwrap_or(&512) as u64;
                total_read += (x.read_sectors as u64) * sector_size;
                total_write += (x.write_sectors as u64) * sector_size;
            });
        let mut disk_usage: DiskIO = Default::default();
        if self.last_disk_io.total_read > 0 {
            disk_usage.read = total_read - self.last_disk_io.total_read;
            disk_usage.write = total_write - self.last_disk_io.total_write;
        }
        disk_usage.total_read = total_read;
        disk_usage.total_write = total_write;
        self.last_disk_io = disk_usage;
        disk_usage
    }

    pub fn get_overview(&mut self) -> Overview {
        Overview {
            load_avg: self.get_load_avg(),
            cpu_usage: self.get_cpu_usage(),
            memory_usage: self.get_mem_usage(),
            network_io: self.get_network_io(),
            disk_usage: self.get_disk_usage(),
            disk_io: self.get_disk_io(),
        }
    }

    pub fn get_cpu_info(&mut self) -> CpuInfo {
        CpuInfo {
            core_num: self.sys.physical_core_count().unwrap_or_default(),
            brand: self.sys.cpus()[0].brand().to_string(),
            frequency: self.sys.global_cpu_info().frequency(),
            vendor_id: self.sys.cpus()[0].vendor_id().to_string(),
        }
    }

    pub fn get_cpu_stat(&mut self) -> Vec<CpuUsage> {
        self.sys
            .cpus()
            .iter()
            .map(|x| CpuUsage {
                name: x.name().to_string(),
                cpu_usage: format!("{:.1}", x.cpu_usage())
                    .parse::<f32>()
                    .unwrap_or_default(),
            })
            .collect()
    }

    pub fn get_disk_detail(&mut self) -> Vec<DiskDetail> {
        self.disks.refresh();
        self.disks.iter().map(|x| x.into()).collect()
    }

    pub fn get_network_detail(&mut self) -> Vec<NetworkDetail> {
        self.networks.refresh();
        NetworkDetail::new_list(&self.networks)
    }

    pub fn get_process(&mut self) -> Vec<SimpleProcess> {
        self.sys.processes().iter().map(|x| x.1.into()).collect()
    }

    pub fn get_process_by_id(&mut self, pid: String) -> Option<Process> {
        self.sys.process(pid.parse().unwrap()).map(|x| x.into())
    }

    pub fn get_temperature(&mut self) -> Vec<ComponentTemperature> {
        self.components.refresh();
        self.components.iter().map(|x| x.into()).collect()
    }

    pub fn get_os_overview(&mut self) -> OsOverview {
        self.users.refresh_list();
        OsOverview {
            name: System::name().unwrap_or_else(|| "<unknown>".to_owned()),
            kernel_version: System::kernel_version().unwrap_or_else(|| "<unknown>".to_owned()),
            os_version: System::long_os_version().unwrap_or_else(|| "<unknown>".to_owned()),
            hostname: System::host_name().unwrap_or_else(|| "<unknown>".to_owned()),
            cpu_info: self.get_cpu_info(),
            users: self
                .users
                .iter()
                .map(|user| User {
                    uid: user.id().to_string(),
                    gid: user.group_id().to_string(),
                    name: user.name().to_string(),
                    groups: user.groups().iter().map(|x| x.name().to_string()).collect(),
                })
                .collect(),
            boot_time: self.get_boot_time(),
        }
    }

    pub fn get_realtime_status(&mut self) -> RealtimeStatus {
        RealtimeStatus {
            cpu: self.get_cpu_stat(),
            network: self.get_network_detail(),
            disk: self.get_disk_detail(),
            uptime: self.get_uptime(),
            temp: self.get_temperature(),
        }
    }

    pub fn get_full_fusion(&mut self) -> Fusion {
        self.sys.refresh_all();
        Fusion::new_full(
            self.get_overview().convert(),
            Option::from(self.get_os_overview().convert()),
            Option::from(self.get_realtime_status().convert()),
        )
    }

    pub fn get_less_fusion(&mut self) -> Fusion {
        SystemInfo::refresh_less(self);
        Fusion::new_less(self.get_overview().convert())
    }

    pub fn get_fusion_with_simple_process(&mut self) -> Fusion {
        self.sys.refresh_all();

        let processes_vo: Vec<SimpleProcessVo> =
            self.get_process().iter().map(|x| x.convert()).collect();

        Fusion::new_simple_process(
            self.get_overview().convert(),
            Option::from(self.get_os_overview().convert()),
            Option::from(self.get_realtime_status().convert()),
            Option::from(processes_vo),
        )
    }

    pub fn get_process_fusion(&mut self, pid: Option<String>, sort: Option<Sort>) -> Fusion {
        self.sys.refresh_all();
        let mut processes: Vec<SimpleProcess> = self.get_process();
        // Sort
        if let Some(sort) = sort {
            SystemInfo::sort_process(&mut processes, sort);
        }

        let mut p = if let Some(pid) = pid {
            self.get_process_by_id(pid)
        } else {
            None
        };

        let processes_vo: Vec<SimpleProcessVo> = processes.iter().map(|x| x.convert()).collect();

        let current_process = p.as_mut().map(|x| {
            let mut process_vo = x.convert();

            let mut children: Vec<u32> = processes
                .iter()
                .filter(|y| y.parent_id.is_some() && y.parent_id.unwrap() == x.pid)
                .map(|x| x.pid)
                .collect();
            children.sort();
            process_vo.children = Some(children.iter().map(|c| c.to_string()).collect());

            // user_id to username
            process_vo.user = if let Some(user_id) = &x.user_id {
                if let Ok(uid) = Uid::from_str(user_id) {
                    self.users.refresh_list();
                    self.users
                        .get_user_by_id(&uid)
                        .map(|x| x.name().to_string())
                } else {
                    None
                }
            } else {
                None
            };
            process_vo
        });
        Fusion::new_process(
            self.get_overview().convert(),
            Some(processes_vo),
            current_process,
        )
    }

    fn sort_process(processes: &mut [SimpleProcess], sort: Sort) {
        match sort.by {
            SortBy::Pid => match sort.order {
                SortOrder::Up => {
                    processes.sort_by(|a, b| a.pid.partial_cmp(&b.pid).unwrap());
                }
                SortOrder::Down => {
                    processes.sort_by(|a, b| b.pid.partial_cmp(&a.pid).unwrap());
                }
            },
            SortBy::Name => match sort.order {
                SortOrder::Up => {
                    processes.sort_by(|a, b| a.name.partial_cmp(&b.name).unwrap());
                }
                SortOrder::Down => {
                    processes.sort_by(|a, b| b.name.partial_cmp(&a.name).unwrap());
                }
            },
            SortBy::Cpu => match sort.order {
                SortOrder::Up => {
                    processes.sort_by(|a, b| a.cpu_usage.partial_cmp(&b.cpu_usage).unwrap());
                }
                SortOrder::Down => {
                    processes.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap());
                }
            },
            SortBy::Memory => match sort.order {
                SortOrder::Up => {
                    processes.sort_by(|a, b| a.memory.partial_cmp(&b.memory).unwrap());
                }
                SortOrder::Down => {
                    processes.sort_by(|a, b| b.memory.partial_cmp(&a.memory).unwrap());
                }
            },
        }
    }

    // 仅刷新cpu、内存、网络、磁盘的私有函数
    fn refresh_less(&mut self) {
        self.sys.refresh_cpu();
        self.sys.refresh_memory();
    }
}
