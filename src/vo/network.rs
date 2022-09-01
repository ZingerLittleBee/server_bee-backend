use crate::model::network::NetworkIO;
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