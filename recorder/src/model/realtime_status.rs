use crate::model::component::ComponentTemperature;
use crate::model::cpu::CpuUsage;
use crate::model::disk::DiskDetail;
use crate::model::network::NetworkDetail;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct RealtimeStatus {
    pub cpu: Vec<CpuUsage>,
    pub network: Vec<NetworkDetail>,
    pub disk: Vec<DiskDetail>,
    pub uptime: Vec<u64>,
    pub temp: Vec<ComponentTemperature>,
}

impl RealtimeStatus {
    pub fn merge_temperature_data(&self) -> Vec<ComponentTemperature> {
        let mut grouped_data: HashMap<String, f32> = HashMap::new();

        for (_, temp) in self.temp.iter().enumerate() {
            if let Some(group_temp) = grouped_data.get(&temp.label) {
                grouped_data.insert(temp.label.clone(), (group_temp + temp.temperature) / 2.0);
            } else {
                grouped_data.insert(temp.label.clone(), temp.temperature);
            }
        }
        grouped_data
            .iter()
            .map(|(label, temp)| ComponentTemperature {
                label: label.clone(),
                temperature: *temp,
            })
            .collect()
    }
}
