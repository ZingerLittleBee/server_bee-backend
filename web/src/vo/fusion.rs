use crate::vo::overview::{OsOverviewVo, OverviewVo};
use crate::vo::realtime_status::RealtimeStatusVo;
use bytestring::ByteString;
use serde::{Deserialize, Serialize};
use crate::vo::process::ProcessVo;
use crate::vo::simple_process::SimpleProcessVo;

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
}

impl From<Fusion> for ByteString {
    fn from(fusion: Fusion) -> Self {
        serde_json::to_string(&fusion).unwrap().into()
    }
}

impl Fusion {
    pub fn new_less(overview: OverviewVo) -> Self {
        Fusion {
            overview,
            os: None,
            realtime: None,
            process: None,
            current_process: None,
        }
    }

    pub fn new_full(
        overview: OverviewVo,
        os: Option<OsOverviewVo>,
        realtime: Option<RealtimeStatusVo>,
    ) -> Self {
        Fusion {
            overview,
            os,
            realtime,
            process: None,
            current_process: None,
        }
    }

    pub fn new_process(
        overview: OverviewVo,
        process: Option<Vec<SimpleProcessVo>>,
        current_process: Option<ProcessVo>,
    ) -> Self {
        Fusion {
            overview,
            os: None,
            realtime: None,
            process,
            current_process,
        }
    }
}
