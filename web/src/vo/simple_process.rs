use crate::model::simple_process::SimpleProcess;
use crate::vo::formator::{Convert, FormatData, Formator};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Debug)]
pub struct SimpleProcessVo {
    pub name: String,

    pub pid: String,

    pub cpu: String,

    pub memory: FormatData,
}

impl Convert<SimpleProcessVo> for SimpleProcess {
    fn convert(&self) -> SimpleProcessVo {
        let formator = Formator::new();
        SimpleProcessVo {
            name: self.name.clone(),
            pid: self.pid.to_string(),
            cpu: format!("{:.2}", self.cpu_usage),
            memory: formator.format_from_byte(self.memory),
        }
    }
}
