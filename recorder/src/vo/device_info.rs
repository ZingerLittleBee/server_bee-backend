use crate::vo::disk::DiskDetailVo;
use crate::vo::formator::{Convert, FormatData, Formator};
use crate::vo::network::NetworkInfoVo;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct DeviceInfoVo {
    name: String,
    hostname: String,
    kernel: String,
    cup_num: String,
    brand: String,
    frequency: String,
    vendor: String,
    memory: FormatData,
    swap: FormatData,
    version: String,
    disk: Vec<DiskDetailVo>,
    network: Vec<NetworkInfoVo>,
}
