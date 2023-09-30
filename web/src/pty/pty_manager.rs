use std::fmt::Debug;

use crate::pty::shell_type::ShellType;
use anyhow::Context;
use atty::Stream;
use log::info;
use nix::libc;
use nix::pty::openpty;
use nix::unistd::{fork, ForkResult};
use std::os::fd::RawFd;
use std::os::unix::prelude::{CommandExt, FromRawFd};
use std::process::{Command, Stdio};
use std::thread;
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::sync::mpsc::{Receiver, Sender};

#[derive(Debug)]
pub struct PtyManager {
    pty_in: File,
    pty_out: File,
    master: RawFd,
    slave: RawFd,
    history: Vec<u8>,
    stop_read_tx: Option<Sender<()>>,
}

#[derive(Debug, Eq, PartialEq)]
pub enum PtyMessage {
    Buffer(Vec<u8>),
}

impl PtyManager {
    pub fn new(shell: ShellType) -> Self {
        let pty = match openpty(None, None) {
            Ok(pty) => pty,
            Err(e) => panic!("open pty failed: {}", e),
        };
        let master = pty.master;
        let slave = pty.slave;

        let mut builder = Command::new(shell.to_str());
        builder.arg("-l");

        match unsafe { fork() } {
            Ok(ForkResult::Parent { child: pid, .. }) => {
                thread::spawn(move || {
                    let mut status = 0;
                    unsafe { libc::waitpid(i32::from(pid), &mut status, 0) };
                    log::warn!("child process exit!");
                    std::process::exit(0);
                });
            }
            Ok(ForkResult::Child) => {
                unsafe { ioctl_rs::ioctl(master, ioctl_rs::TIOCNOTTY) };
                unsafe { libc::setsid() };
                unsafe { ioctl_rs::ioctl(slave, ioctl_rs::TIOCSCTTY) };

                builder
                    .stdin(unsafe { Stdio::from_raw_fd(slave) })
                    .stdout(unsafe { Stdio::from_raw_fd(slave) })
                    .stderr(unsafe { Stdio::from_raw_fd(slave) })
                    .exec();
            }
            Err(_) => println!("Fork failed"),
        }

        let pty_in = unsafe { File::from_raw_fd(master) };
        let pty_out = unsafe { File::from_raw_fd(master) };

        Self {
            master,
            slave,
            pty_in,
            pty_out,
            history: Vec::new(),
            stop_read_tx: None,
        }
    }

    pub async fn start(&mut self) -> Receiver<PtyMessage> {
        self.pty_output_handler().await
    }

    pub async fn write_all(&mut self, data: &[u8]) -> anyhow::Result<()> {
        self.pty_in.write_all(data).await.context("pty write error")
    }

    async fn pty_output_handler(&mut self) -> Receiver<PtyMessage> {
        let mut history = self.history.clone();
        let mut pty_out = self.pty_out.try_clone().await.unwrap();
        let (tx, rx) = tokio::sync::mpsc::channel::<PtyMessage>(100);

        let (stop_read_tx, mut stop_read_rx) = tokio::sync::mpsc::channel(1);
        self.stop_read_tx = Some(stop_read_tx);

        tokio::spawn(async move {
            match tx.send(PtyMessage::Buffer(vec![])).await {
                Ok(_) => {}
                Err(e) => {
                    info!("send pty message error: {}", e);
                }
            }

            let mut buf: [u8; 1024] = [0; 1024];

            loop {
                tokio::select! {
                    size = pty_out.read(&mut buf) => {
                        match size {
                            Ok(size) => {
                                if size == 0 {
                                    std::process::exit(0);
                                }

                                let message = PtyMessage::Buffer(buf[..size].to_vec());
                                history.append(&mut buf[..size].to_vec());
                                if let Err(e) = tx.send(message).await {
                                    info!("Send pty message error: {}", e);
                                }
                                buf.fill(0);
                            },
                            Err(e) => {
                                info!("Read output from pty error: {}", e);
                                break;
                            }
                        }
                    }
                    _ = stop_read_rx.recv() => {
                        info!("Stop signal received, breaking the loop");
                        break;
                    }
                }
            }
        });
        rx
    }

    pub fn history(&self) -> Vec<u8> {
        self.history.clone()
    }

    pub fn set_termsize(&self, mut size: Box<libc::winsize>) -> bool {
        (unsafe { libc::ioctl(self.slave, libc::TIOCSWINSZ, &mut *size) } as i32) > 0
    }

    pub fn get_termsize(fd: i32) -> Option<Box<libc::winsize>> {
        let mut ret = 0;
        let mut size = Box::new(libc::winsize {
            ws_row: 25,
            ws_col: 80,
            ws_xpixel: 0,
            ws_ypixel: 0,
        });

        if atty::is(Stream::Stdin) {
            ret = unsafe { libc::ioctl(fd, libc::TIOCGWINSZ, &mut *size) } as i32;
        } else {
            size.ws_row = 25;
            size.ws_col = 80;
        };

        if ret < 0 {
            return None;
        }
        Some(size)
    }
}
