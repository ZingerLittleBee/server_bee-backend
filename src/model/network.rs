use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct NetworkIO {
    pub received: u64,
    pub total_received: u64,
    pub transmitted: u64,
    pub total_transmitted: u64,
}
