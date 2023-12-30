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
