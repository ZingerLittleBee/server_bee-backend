use crate::model::memory::MemoryUsage;
use crate::vo::formator::{Convert, FormatData, Formator};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct MemUsageVo {
    pub total: FormatData,
    pub used: FormatData,
    pub free: FormatData,
    pub swap_total: FormatData,
    pub swap_used: FormatData,
    pub swap_free: FormatData,
}

impl Convert<MemUsageVo> for MemoryUsage {
    fn convert(&self) -> MemUsageVo {
        let formator = Formator::new();
        MemUsageVo {
            total: formator.format_from_kilo_byte(self.total as f64),
            used: formator.format_from_kilo_byte(self.used as f64),
            free: formator.format_from_kilo_byte(self.free as f64),
            swap_total: formator.format_from_kilo_byte(self.swap_total as f64),
            swap_used: formator.format_from_kilo_byte(self.swap_used as f64),
            swap_free: formator.format_from_kilo_byte(self.swap_free as f64),
        }
    }
}
