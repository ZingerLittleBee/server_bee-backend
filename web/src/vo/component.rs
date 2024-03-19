use crate::model::component::ComponentTemperature;
use crate::vo::formator::{Convert, FormatData, Formator};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct ComponentTemperatureVo {
    pub label: String,
    pub temp: FormatData,
}

impl Convert<ComponentTemperatureVo> for ComponentTemperature {
    fn convert(&self) -> ComponentTemperatureVo {
        let formator = Formator::new();
        ComponentTemperatureVo {
            label: self.label.clone(),
            temp: formator.format_from_celsius(self.temperature),
        }
    }
}
