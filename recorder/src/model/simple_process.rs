use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct SimpleProcess {
    pub name: String,

    pub pid: u32,

    pub parent_id: Option<u32>,

    pub cpu_usage: f32,

    pub memory: u64,
}
