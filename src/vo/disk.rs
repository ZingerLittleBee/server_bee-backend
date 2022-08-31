use crate::model::disk::DiskIO;
use crate::model::usage::Usage;
use crate::vo::formator::{Convert, FormatData, Formator};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct DiskUsageVo {
    pub total: FormatData,
    pub used: FormatData,
    pub free: FormatData,
}

impl Convert<DiskUsageVo> for Usage {
    fn convert(&self) -> DiskUsageVo {
        let formator = Formator::new();
        DiskUsageVo {
            total: formator.format_from_byte(self.total),
            used: formator.format_from_byte(self.used),
            free: formator.format_from_byte(self.free),
        }
    }
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct DiskIOFormat {
    pub read: FormatData,
    pub total_read: FormatData,
    pub write: FormatData,
    pub total_write: FormatData,
}

impl Convert<DiskIOFormat> for DiskIO {
    fn convert(&self) -> DiskIOFormat {
        let formator = Formator::new();
        DiskIOFormat {
            read: formator.format_from_byte(self.read),
            total_read: formator.format_from_byte(self.total_read),
            write: formator.format_from_byte(self.write),
            total_write: formator.format_from_byte(self.total_write),
        }
    }
}
