use anyhow::Result;
use serde::{Deserialize, Serialize};
use sled::Db;

#[derive(Debug, Clone)]
pub struct DbWrapper {
    db: Db,
}

impl DbWrapper {
    fn init_sled_db() -> Db {
        sled::open("db").unwrap()
    }

    pub fn new() -> DbWrapper {
        DbWrapper {
            db: DbWrapper::init_sled_db(),
        }
    }

    pub fn get<T: for<'de> Deserialize<'de>>(&self, key: &str) -> Result<Option<T>> {
        self.db
            .get(key)?
            .map(|v| Ok(serde_json::from_slice(&v.as_ref())?))
            .transpose()
    }

    pub fn set<T: Serialize>(&self, key: &str, data: &T) {
        self.db
            .insert(key, serde_json::to_string(&data).unwrap().as_bytes())
            .unwrap();
    }
}
