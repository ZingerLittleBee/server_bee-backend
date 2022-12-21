Language : 🇺🇸 English | [🇨🇳 简体中文](./README.zh-CN.md)

<center>
    <h1>server_bee-backend</h1>
</center>

<div align="center">

Backend for iOS application named [ServerBee](https://apps.apple.com/us/app/serverbee/id6443553714)

![GitHub release (latest by date)](https://img.shields.io/github/v/release/ZingerLittleBee/server_bee-backend?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/ZingerLittleBee/server_bee-backend?style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/ZingerLittleBee/server_bee-backend/Release?style=flat-square)

</div>

# Overview
- module `web` provide data from server
- module `deploy` provide **AutoLaunch**、**AutoUpdate**、**SetPort**、**DownloadWebModule**

# Features

- CPU load
- load average
- memory usage
- uptime / boot time
- filesystem mounts (and disk usage)
- disk I/O statistics
- network interfaces
- network traffic statistics

# How to use

## Installation

### Linux、MacOS

From [Release Page](https://github.com/ZingerLittleBee/server_bee-backend/releases) get the latest version download address

```bash
# download the corresponding version according to the system architecture
wget https://github.com/ZingerLittleBee/server_bee-backend/releases/download/latest/serverbee-deploy-x86_64-apple-darwin.zip

unzip serverbee-deploy-x86_64-apple-darwin.zip

# default port is 9527
./serverbee-deploy
```

### Windows
1. Download the latest version from [release](https://github.com/ZingerLittleBee/server_bee-backend/releases)

2. unzip serverbee-deploy-x86_64-pc-windows-gnu.zip

3. run serverbee-deploy.exe

## Use custom port
```bash
./serverbee-deploy -p 8081
```

## Disable auto launch
```bash
./serverbee-deploy -a
```

# How to compile
```bash
cargo build --release
```
and then you can find the binary file in `target/release`

# Found an issue or have a proposal
[Create an issue](https://github.com/zingerlittlebee/server_bee-backend/issues/new)

# Release Notes
SEE [CHANGELOG](CHANGELOG.md)
