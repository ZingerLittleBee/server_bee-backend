use crate::vo::fusion::Fusion;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Record {
    fusion: Fusion,
    time: u64,
}
