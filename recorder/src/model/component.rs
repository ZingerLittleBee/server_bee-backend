use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct ComponentTemperature {
    pub label: String,
    pub temperature: f32,
}
