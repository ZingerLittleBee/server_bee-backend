use crate::vo::overview::{OsOverviewVo, OverviewVo};
use crate::vo::process::ProcessVo;
use crate::vo::realtime_status::RealtimeStatusVo;
use crate::vo::simple_process::SimpleProcessVo;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct Fusion {
    pub overview: OverviewVo,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub os: Option<OsOverviewVo>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub realtime: Option<RealtimeStatusVo>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub process: Option<Vec<SimpleProcessVo>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub current_process: Option<ProcessVo>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub full_process: Option<Vec<ProcessVo>>,
}
