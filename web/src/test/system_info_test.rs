#[cfg(test)]
mod system_info_test {
    use crate::system_info::SystemInfo;

    #[test]
    fn test_system_info_new() {
        let result = std::panic::catch_unwind(|| SystemInfo::new());
        assert!(result.is_ok());
    }

    #[test]
    fn test_get_cpu_usage() {
        let mut system_info = SystemInfo::new();
        let cpu_usage = system_info.get_cpu_usage();
        assert_eq!(cpu_usage >= 0.0, true);
    }

    #[test]
    fn test_get_memory_usage() {
        let mut system_info = SystemInfo::new();
        let memory_usage = system_info.get_mem_usage();
        assert!(memory_usage.total >= memory_usage.used);
        assert!(memory_usage.total >= memory_usage.free);
        assert!(memory_usage.swap_total >= memory_usage.swap_used);
        assert!(memory_usage.swap_total >= memory_usage.swap_free);
    }

    #[test]
    fn test_get_disk_usage() {
        let mut system_info = SystemInfo::new();
        let disk_usage = system_info.get_disk_usage();
        assert!(disk_usage.total >= disk_usage.used);
        assert!(disk_usage.total >= disk_usage.free);
    }

    #[test]
    fn test_get_network_io() {
        let mut system_info = SystemInfo::new();
        let network_io = system_info.get_network_io();
        assert!(network_io.total_received > network_io.received);
        assert!(network_io.total_transmitted > network_io.transmitted);
    }

    #[test]
    fn test_get_boot_time() {
        let mut system_info = SystemInfo::new();
        let boot_time = system_info.get_boot_time();
        assert!(boot_time > 0);
    }

    #[test]
    fn test_get_uptime() {
        let mut system_info = SystemInfo::new();
        let uptime = system_info.get_uptime();
        assert_eq!(uptime.len(), 3);
    }

    #[test]
    fn test_get_load_avg() {
        let mut system_info = SystemInfo::new();
        let load_average = system_info.get_load_avg();
        assert_eq!(load_average.len(), 3);
    }

    #[test]
    fn test_get_disk_io() {
        #[cfg(target_os = "linux")]
        let mut system_info = SystemInfo::new();

        #[cfg(not(target_os = "linux"))]
        let mut system_info = SystemInfo::new();

        let disk_io = system_info.get_disk_io();
        assert!(disk_io.total_read >= disk_io.read);
        assert!(disk_io.total_write >= disk_io.write);
    }

    #[test]
    fn test_get_overview() {
        let mut system_info = SystemInfo::new();
        let overview = system_info.get_overview();
        assert_eq!(overview.load_avg.len(), 3);
        assert!(overview.cpu_usage >= 0.0);
        assert!(overview.memory_usage.total >= overview.memory_usage.used);
        assert!(overview.memory_usage.total >= overview.memory_usage.free);
        assert!(overview.memory_usage.swap_total >= overview.memory_usage.swap_used);
        assert!(overview.memory_usage.swap_total >= overview.memory_usage.swap_free);
        assert!(overview.disk_usage.total >= overview.disk_usage.used);
        assert!(overview.disk_usage.total >= overview.disk_usage.free);
        assert!(overview.network_io.total_received > overview.network_io.received);
        assert!(overview.network_io.total_transmitted > overview.network_io.transmitted);
        assert!(overview.disk_io.total_read >= overview.disk_io.read);
        assert!(overview.disk_io.total_write >= overview.disk_io.write);
    }

    #[test]
    fn test_get_cpu_info() {
        let mut system_info = SystemInfo::new();
        let cpu_info = system_info.get_cpu_info();
        assert!(cpu_info.core_num > 0);
    }

    #[test]
    fn test_get_cpu_stat() {
        let mut system_info = SystemInfo::new();
        let cpu_stat = system_info.get_cpu_stat();
        assert!(!cpu_stat.is_empty());
    }

    #[test]
    fn test_get_disk_detail() {
        let mut system_info = SystemInfo::new();
        let disk_detail = system_info.get_disk_detail();
        assert!(!disk_detail.is_empty());
    }

    #[test]
    fn test_get_network_detail() {
        let mut system_info = SystemInfo::new();
        let network_detail = system_info.get_network_detail();
        assert!(!network_detail.is_empty());
    }

    #[test]
    fn test_get_process() {
        let mut system_info = SystemInfo::new();
        let process_list = system_info.get_process();
        assert!(!process_list.is_empty());
    }

    #[test]
    fn test_get_process_by_id() {
        let mut system_info = SystemInfo::new();
        let process_list = system_info.get_process();
        let process = system_info.get_process_by_id(process_list[0].pid.to_string());
        assert!(process.is_some());
    }

    #[test]
    fn test_get_temperature() {
        let result = std::panic::catch_unwind(|| SystemInfo::new().get_temperature());
        assert!(result.is_ok());
    }

    #[test]
    fn test_get_os_overview() {
        let result = std::panic::catch_unwind(|| SystemInfo::new().get_os_overview());
        assert!(result.is_ok());
    }

    #[test]
    fn test_get_realtime_status() {
        let result = std::panic::catch_unwind(|| SystemInfo::new().get_realtime_status());
        assert!(result.is_ok());
    }

    #[test]
    fn test_get_full_fusion() {
        let result = std::panic::catch_unwind(|| SystemInfo::new().get_full_fusion());
        assert!(result.is_ok());
    }

    #[test]
    fn test_get_less_fusion() {
        let mut system_info = SystemInfo::new();
        let fusion = system_info.get_less_fusion();
        assert!(fusion.current_process.is_none());
        assert!(fusion.full_process.is_none());
        assert!(fusion.os.is_none());
        assert!(fusion.process.is_none());
        assert!(fusion.realtime.is_none());
    }

    #[test]
    fn test_get_fusion_with_simple_process() {
        let mut system_info = SystemInfo::new();
        let fusion = system_info.get_fusion_with_simple_process();
        assert!(fusion.current_process.is_none());
        assert!(fusion.full_process.is_none());
        assert!(fusion.os.is_some());
        assert!(fusion.realtime.is_some());
        assert!(fusion.process.is_some());
    }

    #[test]
    fn test_get_process_fusion() {
        let mut system_info = SystemInfo::new();
        let process = system_info.get_process();
        let fusion = system_info.get_process_fusion(Option::from(process[0].pid.to_string()), None);
        assert!(fusion.full_process.is_none());
        assert!(fusion.os.is_none());
        assert!(fusion.realtime.is_none());
        assert!(fusion.process.is_some());
        assert!(fusion.current_process.is_some());
    }
}
