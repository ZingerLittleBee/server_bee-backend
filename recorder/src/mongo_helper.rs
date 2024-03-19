use crate::constant::db::{
    DATABASE_NAME, INVALID_COLLECTION_INDEX, INVALID_COLLECTION_NAME, RECORD_COLLECTION_NAME,
    RECORD_COLLECTION_SERVER_ID_INDEX, RECORD_COLLECTION_TIME_INDEX,
};
use crate::vo::record::Record;
use anyhow::Result;
use log::{debug, info};
use mongodb::bson::{doc, Document};
use mongodb::options::IndexOptions;
use mongodb::{Client, Collection, IndexModel};

pub struct DbConnector {
    pub record_collection: Collection<Record>,
    pub invalid_collection: Collection<Document>,
}

impl DbConnector {
    pub async fn connect(uri: String) -> Result<Self> {
        init_mongo(uri).await
    }
}

async fn init_mongo(uri: String) -> Result<DbConnector> {
    let client = Client::with_uri_str(uri).await.unwrap();
    let database = client.database(DATABASE_NAME);
    let record_collection: Collection<Record> = database.collection(RECORD_COLLECTION_NAME);
    let invalid_collection: Collection<Document> = database.collection(INVALID_COLLECTION_NAME);

    // check or create collection
    create_collection_if_not_exists(&database, RECORD_COLLECTION_NAME).await?;
    create_collection_if_not_exists(&database, INVALID_COLLECTION_NAME).await?;

    // create index for record
    create_index_if_not_exists(
        &record_collection,
        doc! {RECORD_COLLECTION_SERVER_ID_INDEX: 1},
    )
    .await?;
    create_index_if_not_exists(&record_collection, doc! {RECORD_COLLECTION_TIME_INDEX: 1}).await?;
    create_index_if_not_exists(
        &record_collection,
        doc! {RECORD_COLLECTION_SERVER_ID_INDEX: 1, RECORD_COLLECTION_TIME_INDEX: -1},
    )
    .await?;

    // create index for invalid
    create_index_if_not_exists(&invalid_collection, doc! {INVALID_COLLECTION_INDEX: 1}).await?;

    Ok(DbConnector {
        record_collection,
        invalid_collection,
    })
}

async fn create_collection_if_not_exists(db: &mongodb::Database, name: &str) -> Result<()> {
    let collection_names = db.list_collection_names(None).await?;
    if !collection_names.contains(&name.to_string()) {
        info!("create collection: {}", name);
        db.create_collection(name, None).await?;
    }
    Ok(())
}

async fn create_index_if_not_exists<T>(collection: &Collection<T>, keys: Document) -> Result<()>
where
    T: serde::Serialize + serde::de::DeserializeOwned + Unpin + Sync + Send,
{
    let index_options = IndexOptions::builder().name(keys.to_string()).build();
    let index_model = IndexModel::builder()
        .keys(keys)
        .options(index_options)
        .build();

    let index_names = collection.list_index_names().await?;
    debug!("list_index_names: {:?}", index_names);

    if !index_names.contains(&index_model.keys.to_string()) {
        info!("create index: {}", index_model.keys.to_string());
        collection.create_index(index_model, None).await?;
    } else {
        debug!(
            "index: {} already exists, skip",
            index_model.keys.to_string()
        );
    }
    Ok(())
}
