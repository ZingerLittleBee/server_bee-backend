use anyhow::Result;
use serde::{Deserialize, Serialize};
use sled::Db;
use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct DbWrapper {
    db: Db,
}

impl DbWrapper {
    fn init_sled_db(path: PathBuf) -> Db {
        sled::open(path).unwrap()
    }

    pub fn new(path: Option<PathBuf>) -> DbWrapper {
        DbWrapper {
            db: DbWrapper::init_sled_db(
                path.map(|p| p.join("db"))
                    .unwrap_or_else(|| PathBuf::from("db")),
            ),
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
