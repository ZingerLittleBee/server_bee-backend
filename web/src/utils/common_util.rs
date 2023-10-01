use chrono::{Local, NaiveDateTime, TimeZone, Utc};

pub fn get_now_timestamp() -> u64 {
    let now = Utc::now();
    return now.timestamp() as u64;
}

pub fn get_terminal_time_format(timestamp: u64) -> String {
    let naive_datetime = NaiveDateTime::from_timestamp_opt(timestamp as i64, 0);
    if naive_datetime.is_none() {
        return String::from("");
    }
    let datetime = Local.from_utc_datetime(&naive_datetime.unwrap());
    datetime.format("%a %b %e %T").to_string()
}
