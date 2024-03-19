use crate::vo::fusion::Fusion;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Record {
    server_id: Option<String>,
    fusion: Fusion,
    time: u64,
}

impl Record {
    pub fn set_server_id(&mut self, server_id: String) {
        self.server_id = Some(server_id);
    }
}
