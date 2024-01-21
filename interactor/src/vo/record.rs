use crate::vo::fusion::Fusion;
use bytestring::ByteString;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Record {
    server_id: String,
    fusion: Fusion,
    time: u64,
}

impl Record {
    pub fn get_fusion(self) -> Fusion {
        self.fusion
    }

    pub fn overview(self) -> Self {
        Self {
            server_id: self.server_id,
            fusion: self.fusion,
            time: self.time,
        }
    }
}

impl From<Record> for ByteString {
    fn from(record: Record) -> Self {
        serde_json::to_string(&record).unwrap().into()
    }
}
