use serde::{Deserialize, Serialize};

#[derive(Deserialize, Default, Debug, Clone)]
pub struct FormatData {
    value: String,
    unit: String,
}

impl Serialize for FormatData {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        (&self.value, &self.unit).serialize(serializer)
    }
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

pub trait Convert<V> {
    fn convert(&self) -> V;
}

pub enum DeFormatorFormat {
    Byte,
    KiloByte,
    MegaByte,
    GigaByte,
    TeraByte,
    PetaByte,
    EtaByte,
    Celsius,
}
pub struct DeFormator(DeFormatorFormat);

impl DeFormator {
    pub fn new(format: DeFormatorFormat) -> DeFormator {
        DeFormator(format)
    }

    pub fn de_format(&self, format_data: &FormatData) -> f64 {
        match self.0 {
            DeFormatorFormat::Byte => {
                let value = format_data.value.parse::<f64>().unwrap_or(0.0);
                match format_data.unit.as_str() {
                    "KiB" => value * 1024.0,
                    "MiB" => value * 1024.0 * 1024.0,
                    "GiB" => value * 1024.0 * 1024.0 * 1024.0,
                    "TiB" => value * 1024.0 * 1024.0 * 1024.0 * 1024.0,
                    "PiB" => value * 1024.0 * 1024.0 * 1024.0 * 1024.0 * 1024.0,
                    "EiB" => value,
                    _ => value,
                };
                value
            }
            _ => 0.0,
        }
    }
}
