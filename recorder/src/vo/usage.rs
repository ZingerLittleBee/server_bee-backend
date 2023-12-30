use crate::vo::formator::FormatData;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct UsageVo {
    pub total: FormatData,
    pub used: FormatData,
    pub free: FormatData,
}
