Language : 🇺🇸 English | [🇨🇳 简体中文](./README.zh-CN.md)

<h1 align="center">server_bee-backend</h1>

<div align="center">

Backend for iOS application named [ServerBee](https://apps.apple.com/us/app/serverbee/id6443553714)

![GitHub release (latest by date)](https://img.shields.io/github/v/release/ZingerLittleBee/server_bee-backend?style=for-the-badge)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ZingerLittleBee/server_bee-backend/release.yml?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/ZingerLittleBee/server_bee-backend?style=for-the-badge)

</div>

# Overview
- module `web` provide data from server
- module `deploy` provide **AutoLaunch**、**AutoUpdate**、**DownloadWebModule**

![interactive install](./snapshots/interactive.gif)

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
# tips: download the corresponding version according to the system architecture
# macOS
wget https://github.com/ZingerLittleBee/server_bee-backend/releases/download/v1.1.0/serverbee-deploy-x86_64-apple-darwin.zip
unzip serverbee-deploy-x86_64-apple-darwin.zip

# Linux
wget https://github.com/ZingerLittleBee/server_bee-backend/releases/download/v1.1.0/serverbee-deploy-x86_64-unknown-linux-musl.zip
unzip serverbee-deploy-x86_64-unknown-linux-musl.zip

# default port is 9527
./serverbee-deploy
```

### Windows
1. Download the latest version `serverbee-deploy-x86_64-pc-windows-gnu.zip` from [release](https://github.com/ZingerLittleBee/server_bee-backend/releases)

2. unzip serverbee-deploy-x86_64-pc-windows-gnu.zip

3. double-click to run serverbee-deploy.exe

## More settings

### Interactive install
```bash
./serverbee-deploy -i
```

### Use custom port
```bash
./serverbee-deploy -p 8081
# for unused deploy module
./serverbee-web -p 8081
```

### Enable auto launch (default is enable)
```bash
./serverbee-deploy -a true
```

### Disable auto launch
```bash
./serverbee-deploy -a false
```

### Domestic download
```bash
./serverbee-deploy -d
```

### Foreign download
```bash
./serverbee-deploy -f
```

### Examples
```bash
./serverbee-deploy -p 8081 -a false -d
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
