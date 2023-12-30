use crate::vo::formator::{Convert, FormatData, Formator};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct SimpleProcessVo {
    pub name: String,

    pub pid: String,

    pub cpu: String,

    pub memory: FormatData,
}
