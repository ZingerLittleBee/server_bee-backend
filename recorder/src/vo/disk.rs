use crate::vo::formator::{Convert, FormatData, Formator};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct DiskIOVo {
    pub read: FormatData,
    pub total_read: FormatData,
    pub write: FormatData,
    pub total_write: FormatData,
}

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct DiskDetailVo {
    pub disk_type: String,
    pub device_name: String,
    pub file_system: String,
    pub total_space: FormatData,
    pub available_space: FormatData,
    pub is_removable: bool,
}
