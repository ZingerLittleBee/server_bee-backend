use crate::vo::formator::FormatData;
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
