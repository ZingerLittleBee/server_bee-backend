pub mod config_route;
pub mod local_route;
pub mod page_route;

#[cfg(not(target_os = "windows"))]
pub mod pty_route;
