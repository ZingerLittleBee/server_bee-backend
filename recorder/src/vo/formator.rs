use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct FormatData {
    value: String,
    unit: String,
}

pub trait Convert<V> {
    fn convert(&self) -> V;
}
