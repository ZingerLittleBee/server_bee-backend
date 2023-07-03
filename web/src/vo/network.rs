use crate::model::network::{NetworkDetail, NetworkIO, NetworkInfo};
use crate::vo::formator::{Convert, FormatData, Formator};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct NetworkIOVo {
    pub rx: FormatData,
    pub ttl_rx: FormatData,
    pub tx: FormatData,
    pub ttl_tx: FormatData,
}

impl Convert<NetworkIOVo> for NetworkIO {
    fn convert(&self) -> NetworkIOVo {
        let formator = Formator::new();
        NetworkIOVo {
            rx: formator.format_from_byte(self.received),
            ttl_rx: formator.format_from_byte(self.total_received),
            tx: formator.format_from_byte(self.transmitted),
            ttl_tx: formator.format_from_byte(self.total_transmitted),
        }
    }
}

/// rx = received
/// tx = transmitted
/// pkts = packets
/// ttl = total
#[derive(Deserialize, Serialize, Default, Debug)]
pub struct NetworkDetailVo {
    pub name: String,
    pub packet: Vec<FormatData>,
}

impl Convert<NetworkDetailVo> for NetworkDetail {
    fn convert(&self) -> NetworkDetailVo {
        let formator = Formator::new();
        NetworkDetailVo {
            name: self.name.clone(),
            packet: vec![
                formator.format_from_byte(self.received),
                formator.format_from_byte(self.total_received),
                formator.format_from_byte(self.transmitted),
                formator.format_from_byte(self.total_transmitted),
                formator.format_from_byte(self.packets_received),
                formator.format_from_byte(self.total_packets_received),
                formator.format_from_byte(self.packets_transmitted),
                formator.format_from_byte(self.total_packets_transmitted),
                formator.format_from_byte(self.errors_on_received),
                formator.format_from_byte(self.total_errors_on_received),
                formator.format_from_byte(self.errors_on_transmitted),
                formator.format_from_byte(self.total_errors_on_transmitted),
            ],
        }
    }
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct NetworkInfoVo {
    name: String,
    // ip: String,
    mac: String,
    rx: FormatData,
    tx: FormatData,
}

impl Convert<NetworkInfoVo> for NetworkInfo {
    fn convert(&self) -> NetworkInfoVo {
        let formator = Formator::new();
        NetworkInfoVo {
            name: self.name.clone(),
            // ip: self.ip.clone(),
            mac: self.mac.clone(),
            rx: formator.format_from_byte(self.rx.clone()),
            tx: formator.format_from_byte(self.tx.clone()),
        }
    }
}
