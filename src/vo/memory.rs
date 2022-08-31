use crate::model::usage::Usage;
use crate::vo::formator::{Convert, FormatData, Formator};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct MemUsageVo {
    pub total: FormatData,
    pub used: FormatData,
    pub free: FormatData,
}

impl Convert<MemUsageVo> for Usage {
    fn convert(&self) -> MemUsageVo {
        let formator = Formator::new();
        MemUsageVo {
            total: formator.format_from_kilo_byte(self.total as f64),
            used: formator.format_from_kilo_byte(self.used as f64),
            free: formator.format_from_kilo_byte(self.free as f64),
        }
    }
}
