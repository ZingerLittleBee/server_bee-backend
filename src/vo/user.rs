use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug, Clone)]
pub struct UserVo {
    pub uid: String,
    pub gid: String,
    pub name: String,
    pub groups: Vec<String>,
}
