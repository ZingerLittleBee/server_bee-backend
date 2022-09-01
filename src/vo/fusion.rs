use crate::model::overview::{OsOverview, Overview};
use crate::model::realtime_status::RealtimeStatus;
use serde::{Deserialize, Serialize};
use crate::vo::overview::OverviewVo;
use crate::vo::realtime_status::RealtimeStatusVo;

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct Fusion {
    pub overview: OverviewVo,
    pub os: Option<OsOverviewVo>,
    pub realtime: Option<RealtimeStatusVo>,
}

impl Fusion {
    pub fn new_less(overview: OverviewVo) -> Self {
        Fusion {
            overview,
            os: None,
            realtime: None
        }
    }

    pub fn new_full() -> Self {
        Fusion {
            overview: Overview::default(),
            os: Some(OsOverview::default()),
            realtime: Some(RealtimeStatus::default())
        }
    }
}