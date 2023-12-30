use crate::vo::formator::FormatData;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct SimpleProcessVo {
    pub name: String,

    pub pid: String,

    pub cpu: String,

    pub memory: FormatData,
}
