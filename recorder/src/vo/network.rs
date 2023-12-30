use crate::vo::formator::FormatData;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct NetworkIOVo {
    pub rx: FormatData,
    pub ttl_rx: FormatData,
    pub tx: FormatData,
    pub ttl_tx: FormatData,
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

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct NetworkInfoVo {
    name: String,
    // ip: String,
    mac: String,
    rx: FormatData,
    tx: FormatData,
}
