use crate::model::realtime_status::RealtimeStatus;
use crate::vo::component::ComponentTemperatureVo;
use crate::vo::disk::DiskDetailVo;
use crate::vo::formator::Convert;
use crate::vo::network::NetworkDetailVo;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct RealtimeStatusVo {
    pub cpu: Vec<f32>,
    pub network: Vec<NetworkDetailVo>,
    pub disk: Vec<DiskDetailVo>,
    pub uptime: Vec<u64>,
    pub temp: Vec<ComponentTemperatureVo>,
}

impl Convert<RealtimeStatusVo> for RealtimeStatus {
    fn convert(&self) -> RealtimeStatusVo {
        let mut network = self
            .network
            .iter()
            .map(|network| network.convert())
            .collect::<Vec<NetworkDetailVo>>();
        network.sort_by_key(|net| net.name.to_lowercase());

        let mut disk = self
            .disk
            .iter()
            .map(|disk| disk.convert())
            .collect::<Vec<DiskDetailVo>>();
        disk.sort_by_key(|disk| disk.device_name.to_lowercase());

        let mut cpu_usage = self.cpu.clone();
        cpu_usage.sort_by_key(|c| {
            c.name
                .to_lowercase()
                .replace("cpu", "")
                .trim()
                .parse::<u8>()
                .unwrap_or_default()
        });

        let mut temp: Vec<ComponentTemperatureVo> = self
            .merge_temperature_data()
            .iter()
            .map(|temp| temp.convert())
            .collect();
        temp.sort_by_key(|temp| temp.label.to_lowercase());

        RealtimeStatusVo {
            cpu: cpu_usage.iter().map(|cpu| cpu.cpu_usage).collect(),
            network,
            disk,
            uptime: self.uptime.clone(),
            temp,
        }
    }
}
