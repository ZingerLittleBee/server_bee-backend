use serde::{Deserialize, Serialize};
use sysinfo::Component;

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct ComponentTemperature {
    pub label: String,
    pub temperature: f32,
}

impl From<&Component> for ComponentTemperature {
    fn from(component: &Component) -> Self {
        ComponentTemperature {
            label: component.label().to_string(),
            temperature: component.temperature(),
        }
    }
}
