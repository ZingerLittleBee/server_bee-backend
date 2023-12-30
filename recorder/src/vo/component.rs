use crate::vo::formator::{FormatData};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct ComponentTemperatureVo {
    pub label: String,
    pub temp: FormatData,
}
