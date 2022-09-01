use crate::model::network::{NetworkDetail, NetworkIO};
use crate::vo::formator::{Convert, FormatData, Formator};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct NetworkIOVo {
    pub received: FormatData,
    pub total_received: FormatData,
    pub transmitted: FormatData,
    pub total_transmitted: FormatData,
}

impl Convert<NetworkIOVo> for NetworkIO {
    fn convert(&self) -> NetworkIOVo {
        let formator = Formator::new();
        NetworkIOVo {
            received: formator.format_from_byte(self.received),
            total_received: formator.format_from_byte(self.total_received),
            transmitted: formator.format_from_byte(self.transmitted),
            total_transmitted: formator.format_from_byte(self.total_transmitted),
        }
    }
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct NetworkDetailVo {
    pub name: String,
    pub received: u64,
    pub total_received: u64,
    pub transmitted: u64,
    pub total_transmitted: u64,
    pub packets_received: u64,
    pub total_packets_received: u64,
    pub packets_transmitted: u64,
    pub total_packets_transmitted: u64,
    pub errors_on_received: u64,
    pub total_errors_on_received: u64,
    pub errors_on_transmitted: u64,
    pub total_errors_on_transmitted: u64,
}

impl Convert<NetworkDetailVo> for NetworkDetail {
    fn convert(&self) -> NetworkDetailVo {
        NetworkDetailVo {
            name: self.name.clone(),
            received: self.received,
            total_received: self.total_received,
            transmitted: self.transmitted,
            total_transmitted: self.total_transmitted,
            packets_received: self.packets_received,
            total_packets_received: self.total_packets_received,
            packets_transmitted: self.packets_transmitted,
            total_packets_transmitted: self.total_packets_transmitted,
            errors_on_received: self.errors_on_received,
            total_errors_on_received: self.total_errors_on_received,
            errors_on_transmitted: self.errors_on_transmitted,
            total_errors_on_transmitted: self.total_errors_on_transmitted
        }
            
    }
}