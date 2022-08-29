use crate::model::disk::DiskIO;
use crate::model::network::NetworkIO;
use crate::model::overview::Overview;
use crate::model::usage::Usage;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct FormatData {
    value: String,
    unit: String,
}

impl FormatData {
    pub fn new(value: u64, unit: &str) -> FormatData {
        FormatData {
            value: value.to_string(),
            unit: unit.to_string(),
        }
    }

    pub fn new_with_precision(value: f64, unit: &str, precision: u8) -> FormatData {
        let precision = precision as usize;
        FormatData {
            value: format!("{:.precision$}", value),
            unit: unit.to_string(),
        }
    }
}

struct Formator {
    precision: u8,
}

impl Formator {
    fn new() -> Formator {
        Formator { precision: 1 }
    }

    fn format_from_byte(&self, value: u64) -> FormatData {
        let unit = "B";
        if value > 1024 {
            self.format_from_kilo_byte(value as f64 / 1024.0)
        } else {
            FormatData::new(value, unit)
        }
    }

    fn format_from_kilo_byte(&self, value: f64) -> FormatData {
        let unit = "KiB";
        if value > 1024.0 {
            self.format_from_mega_byte(value / 1024.0)
        } else {
            FormatData::new_with_precision(value, unit, self.precision)
        }
    }

    fn format_from_mega_byte(&self, value: f64) -> FormatData {
        let unit = "MiB";
        if value > 1024.0 {
            self.format_from_giga_byte(value / 1024.0)
        } else {
            FormatData::new_with_precision(value, unit, self.precision)
        }
    }

    fn format_from_giga_byte(&self, value: f64) -> FormatData {
        let unit = "GiB";
        if value > 1024.0 {
            self.format_from_tera_byte(value / 1024.0)
        } else {
            FormatData::new_with_precision(value, unit, self.precision)
        }
    }

    fn format_from_tera_byte(&self, value: f64) -> FormatData {
        let unit = "TiB";
        if value > 1024.0 {
            self.format_from_peta_byte(value / 1024.0)
        } else {
            FormatData::new_with_precision(value, unit, self.precision)
        }
    }

    fn format_from_peta_byte(&self, value: f64) -> FormatData {
        let unit = "PiB";
        if value > 1024.0 {
            self.format_from_eta_byte(value / 1024.0)
        } else {
            FormatData::new_with_precision(value, unit, self.precision)
        }
    }

    fn format_from_eta_byte(&self, value: f64) -> FormatData {
        let unit = "EiB";
        FormatData::new_with_precision(value / 1024.0, unit, self.precision)
    }
}

pub trait Convert<V> {
    fn convert(&self) -> V;
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct UsageFormat {
    pub total: FormatData,
    pub used: FormatData,
    pub free: FormatData,
}

impl Convert<UsageFormat> for Usage {
    fn convert(&self) -> UsageFormat {
        let formator = Formator::new();
        UsageFormat {
            total: formator.format_from_byte(self.total),
            used: formator.format_from_byte(self.used),
            free: formator.format_from_byte(self.free),
        }
    }
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct MemUsageFormat {
    pub total: FormatData,
    pub used: FormatData,
    pub free: FormatData,
}

impl Convert<MemUsageFormat> for Usage {
    fn convert(&self) -> MemUsageFormat {
        let formator = Formator::new();
        MemUsageFormat {
            total: formator.format_from_kilo_byte(self.total as f64),
            used: formator.format_from_kilo_byte(self.used as f64),
            free: formator.format_from_kilo_byte(self.free as f64),
        }
    }
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct NetworkIOFormat {
    pub received: FormatData,
    pub total_received: FormatData,
    pub transmitted: FormatData,
    pub total_transmitted: FormatData,
}

impl Convert<NetworkIOFormat> for NetworkIO {
    fn convert(&self) -> NetworkIOFormat {
        let formator = Formator::new();
        NetworkIOFormat {
            received: formator.format_from_byte(self.received),
            total_received: formator.format_from_byte(self.total_received),
            transmitted: formator.format_from_byte(self.transmitted),
            total_transmitted: formator.format_from_byte(self.total_transmitted),
        }
    }
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct DiskUsageFormat {
    pub total: FormatData,
    pub used: FormatData,
    pub free: FormatData,
}

impl Convert<DiskUsageFormat> for Usage {
    fn convert(&self) -> DiskUsageFormat {
        let formator = Formator::new();
        DiskUsageFormat {
            total: formator.format_from_byte(self.total),
            used: formator.format_from_byte(self.used),
            free: formator.format_from_byte(self.free),
        }
    }
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct DiskIOFormat {
    pub read: FormatData,
    pub total_read: FormatData,
    pub write: FormatData,
    pub total_write: FormatData,
}

impl Convert<DiskIOFormat> for DiskIO {
    fn convert(&self) -> DiskIOFormat {
        let formator = Formator::new();
        DiskIOFormat {
            read: formator.format_from_byte(self.read),
            total_read: formator.format_from_byte(self.total_read),
            write: formator.format_from_byte(self.write),
            total_write: formator.format_from_byte(self.total_write),
        }
    }
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct OverviewFormat {
    pub cpu_usage: String,
    pub memory_usage: MemUsageFormat,
    pub disk_usage: DiskUsageFormat,
    pub disk_io: DiskIOFormat,
    pub network_io: NetworkIOFormat,
}

impl Convert<OverviewFormat> for Overview {
    fn convert(&self) -> OverviewFormat {
        OverviewFormat {
            cpu_usage: format!("{:.1}", self.cpu_usage),
            memory_usage: self.memory_usage.convert(),
            disk_usage: self.disk_usage.convert(),
            disk_io: self.disk_io.convert(),
            network_io: self.network_io.convert(),
        }
    }
}
