use crate::model::process::Process;
use crate::vo::cpu::CpuUsageVo;
use crate::vo::disk::DiskDetailVo;
use crate::vo::network::NetworkDetailVo;

pub struct RealtimeStatusVo {
    pub cpu: Vec<CpuUsageVo>,
    pub load_avg: Vec<f64>,
    pub process: Process,
    pub network: NetworkDetailVo,
    pub disk: DiskDetailVo,
    pub uptime: u64,
}