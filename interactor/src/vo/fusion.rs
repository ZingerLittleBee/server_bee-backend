use crate::vo::formator::{DeFormator, DeFormatorFormat};
use crate::vo::overview::{OsOverviewVo, OverviewVo};
use crate::vo::process::ProcessVo;
use crate::vo::realtime_status::RealtimeStatusVo;
use crate::vo::simple_process::SimpleProcessVo;
use crate::ws::{Sort, SortBy, SortOrder};
use bytestring::ByteString;
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
            full_process: None,
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
            full_process: None,
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
            full_process: None,
        }
    }

    pub fn new_simple_process(
        overview: OverviewVo,
        os: Option<OsOverviewVo>,
        realtime: Option<RealtimeStatusVo>,
        process: Option<Vec<SimpleProcessVo>>,
    ) -> Self {
        Fusion {
            overview,
            os,
            realtime,
            process,
            current_process: None,
            full_process: None,
        }
    }

    pub fn new_full_process(
        overview: OverviewVo,
        os: Option<OsOverviewVo>,
        realtime: Option<RealtimeStatusVo>,
        full_process: Option<Vec<ProcessVo>>,
    ) -> Self {
        Fusion {
            overview,
            os,
            realtime,
            process: None,
            current_process: None,
            full_process,
        }
    }

    pub fn sort_process(self, sort: Sort) -> Self {
        let process = self.process.clone().map(|mut p| {
            match sort.by {
                SortBy::Pid => match sort.order {
                    SortOrder::Up => {
                        p.sort_by(|a, b| {
                            a.pid
                                .parse::<u32>()
                                .unwrap_or_default()
                                .partial_cmp(&b.pid.parse::<u32>().unwrap_or_default())
                                .unwrap_or(std::cmp::Ordering::Equal)
                        });
                    }
                    SortOrder::Down => {
                        p.sort_by(|a, b| {
                            b.pid
                                .parse::<u32>()
                                .unwrap_or_default()
                                .partial_cmp(&a.pid.parse::<u32>().unwrap_or_default())
                                .unwrap_or(std::cmp::Ordering::Equal)
                        });
                    }
                },
                SortBy::Name => match sort.order {
                    SortOrder::Up => {
                        p.sort_by(|a, b| {
                            a.name
                                .partial_cmp(&b.name)
                                .unwrap_or(std::cmp::Ordering::Equal)
                        });
                    }
                    SortOrder::Down => {
                        p.sort_by(|a, b| {
                            b.name
                                .partial_cmp(&a.name)
                                .unwrap_or(std::cmp::Ordering::Equal)
                        });
                    }
                },
                SortBy::Cpu => match sort.order {
                    SortOrder::Up => {
                        p.sort_by(|a, b| {
                            a.cpu
                                .parse::<f32>()
                                .unwrap_or_default()
                                .partial_cmp(&b.cpu.parse::<f32>().unwrap_or_default())
                                .unwrap_or(std::cmp::Ordering::Equal)
                        });
                    }
                    SortOrder::Down => {
                        p.sort_by(|a, b| {
                            b.cpu
                                .parse::<f32>()
                                .unwrap_or_default()
                                .partial_cmp(&a.cpu.parse::<f32>().unwrap_or_default())
                                .unwrap_or(std::cmp::Ordering::Equal)
                        });
                    }
                },
                SortBy::Memory => {
                    let format = DeFormator::new(DeFormatorFormat::Byte);
                    match sort.order {
                        SortOrder::Up => {
                            p.sort_by(|a, b| {
                                format
                                    .de_format(&a.memory)
                                    .partial_cmp(&format.de_format(&b.memory))
                                    .unwrap_or(std::cmp::Ordering::Equal)
                            });
                        }
                        SortOrder::Down => {
                            p.sort_by(|a, b| {
                                format
                                    .de_format(&b.memory)
                                    .partial_cmp(&format.de_format(&a.memory))
                                    .unwrap_or(std::cmp::Ordering::Equal)
                            });
                        }
                    }
                }
            }
            p
        });
        Fusion { process, ..self }
    }
}
