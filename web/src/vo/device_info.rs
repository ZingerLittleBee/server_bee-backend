use serde::{Deserialize, Serialize};
use crate::model::device_info::DeviceInfo;
use crate::vo::disk::DiskDetailVo;
use crate::vo::formator::{Convert, FormatData, Formator};
use crate::vo::network::NetworkInfoVo;


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

impl Convert<DeviceInfoVo> for DeviceInfo {
    fn convert(&self) -> DeviceInfoVo {
        let formator = Formator::new();
        DeviceInfoVo {
            name: self.name.clone(),
            hostname: self.hostname.clone(),
            kernel: self.kernel.clone(),
            cup_num: self.cup_num.to_string(),
            brand: self.brand.clone(),
            frequency: self.frequency.to_string(),
            vendor: self.vendor.clone(),
            memory: formator.format_from_byte(self.memory),
            swap: formator.format_from_byte(self.swap),
            version: self.version.clone(),
            disk: self.disk.iter().map(|x| x.convert()).collect(),
            network: self.network.iter().map(|x| x.convert()).collect(),
        }
    }
}
