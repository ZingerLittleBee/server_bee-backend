Language : 🇺🇸 English | [🇨🇳 简体中文](./README.zh-CN.md)

<h1 align="center">server_bee-backend</h1>

<div align="center">

Backend for iOS application named [ServerBee](https://apps.apple.com/us/app/serverbee/id6443553714)

<a href="https://www.producthunt.com/posts/serverbee?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-serverbee" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=378908&theme=light" alt="ServerBee - Monitor&#0032;and&#0032;manage&#0032;all&#0032;your&#0032;desktop&#0032;systems | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

![GitHub release (latest by date)](https://img.shields.io/github/v/release/ZingerLittleBee/server_bee-backend?style=for-the-badge)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ZingerLittleBee/server_bee-backend/release.yml?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/ZingerLittleBee/server_bee-backend?style=for-the-badge)

</div>

# Overview
- module `web` provide data from server
- module `deploy` provide **AutoLaunch**、**AutoUpdate**、**DownloadWebModule**

## Features
- CPU load
- load average
- memory usage
- uptime / boot time
- filesystem mounts (and disk usage)
- disk I/O statistics
- network interfaces
- network traffic statistics
- process list
- detail process
- kill process
- sub process

## Dashboard for web
![overview](https://assets.serverbee.app/snapshots/overview.png)
![process](https://assets.serverbee.app/snapshots/process.png)
![disk&network](https://assets.serverbee.app/snapshots/disk&network.png)
![terminal](https://assets.serverbee.app/snapshots/terminal.png)
![settings](https://assets.serverbee.app/snapshots/settings.png)

## Interactive install
![interactive install](https://assets.serverbee.app/snapshots/interactive.gif)

# How to use

## Installation
### Quick install(Linux、macOS)
```bash
bash <(curl -s https://raw.githubusercontent.com/ZingerLittleBee/server_bee-backend/main/script/startup.sh)
```

### Docker
> The installation tutorial is located in the documentation 👉 [Docker](https://docs.serverbee.app/en/usage/docker)

```bash
docker run -d \
  -v /proc:/proc \
  --privileged=true \
  --restart unless-stopped \
  --network=host \
  --name=serverbee-web \
  zingerbee/serverbee-web -p 9527
```

### Linux、macOS
> 👇 The installation tutorial is located in the documentation
  > - [Linux](https://docs.serverbee.app/en/usage/linux)
  > - [macOS](https://docs.serverbee.app/en/usage/macos)

From [Release Page](https://github.com/ZingerLittleBee/server_bee-backend/releases) get the latest version download address

```bash
# (optional)
mkdir serverbee
cd serverbee

# tips: download the corresponding version according to the system architecture
# macOS
wget https://github.com/ZingerLittleBee/server_bee-backend/releases/download/v1.2.6/serverbee-deploy-x86_64-apple-darwin.zip
unzip serverbee-deploy-x86_64-apple-darwin.zip

# Linux
wget https://github.com/ZingerLittleBee/server_bee-backend/releases/download/v1.2.6/serverbee-deploy-x86_64-unknown-linux-musl.zip
unzip serverbee-deploy-x86_64-unknown-linux-musl.zip

# default port is 9527
./serverbee-deploy
```

### Windows
> The installation tutorial is located in the documentation 👉 [Windows](https://docs.serverbee.app/en/usage/windows)


1. Download the latest version `serverbee-deploy-x86_64-pc-windows-gnu.zip` from [Release Page](https://github.com/ZingerLittleBee/server_bee-backend/releases)

2. unzip serverbee-deploy-x86_64-pc-windows-gnu.zip

3. double-click to run serverbee-deploy.exe

## More settings
### Allow downloading of pre-release versions
> By default, only stable versions will be downloaded
>
> If you want to download pre-release versions, you can use the --pre-release parameter
```bash
./serverbee-deploy --pre-release
```

### Interactive install
```bash
./serverbee-deploy -i
```

### Enable auto launch (default is enable)
```bash
./serverbee-deploy -a true
```

### Disable auto launch
```bash
./serverbee-deploy -a false
```

### Use custom port
```bash
./serverbee-deploy -p 8081
# for unused deploy module
./serverbee-web -p 8081
```

### Log directory (default is current directory)
```shell
./serverbee-web -l /var/log/serverbee
```

### Data directory (default is current directory)
```shell
./serverbee-web -d /var/lib/serverbee
```

### Examples
```bash
./serverbee-deploy -p 8081 -a false -u true
```

# Configuration related API
The following interfaces can only be accessed from `localhost`

## View all configurations
```bash
curl http://localhost:9527/local/config
```
The response is as follows:
```json
{
    "success": true,
    "data": {
        "web_server": {
            "port": 9527
        },
        "server": {
            "token": "token",
            "host": "serverhub.app",
            "disable_ssl": false
        },
        "app": {
            "token": "token"
        }
    }
}
```

## View `web_server` config
> Related configuration of web server, including port number
```bash
curl http://localhost:9527/local/config/web_server
```
The response is as follows:
```json
{
  "success": true,
  "data": {
    "port": 9527
  }
}
```

## Update the `web_server` configuration
```bash
curl -X POST -H "Content-Type: application/json" -d '{"port": 9527}' http://127.0.0.1:9527/local/config/web_server
```
The response is as follows:
```json
{
  "success": true
}
```

## View `app` config
> App-related configurations, including communication keys
```bash
curl http://localhost:9527/local/config/app
```
The response is as follows:
```json
{
  "success": true,
  "data": {
    "token": "token"
  }
}
```

## Update `app` config
```bash
curl -X POST -H "Content-Type: application/json" -d '{"token": "newToken"}' http://localhost:9527/local/config/app
```
The response is as follows:
```json
{
  "success": true
}
```

## View `server` config
> Server related configuration, including communication key, server address, whether to disable SSL
```bash
curl http://localhost:9527/local/config/server
```
The response is as follows:
```json
{
  "success": true,
  "data": {
    "token": "token",
    "host": "serverhub.app",
    "disable_ssl": false
  }
}
```

## Update `server` config
```bash
curl -X POST -H "Content-Type: application/json" -d '{"token": "newToken", "host": "serverhub.app", "disable_ssl": false}' http://127.0.0.1:9527/local/config/server
```
The response is as follows:
```json
{
  "success": true
}
```

# Compile from source
## 1. Build the front-end source code
> Need to install nodejs, pnpm
```shell
pnpm -C view install
pnpm -C view build
```
The build product is in the `view/dist` directory

## 2. Build web, deploy module source code
> Need to install rust
```bash
cargo build --release
```
and then you can find the binary file in `target/release`

# Found an issue or have a proposal
[Create an issue](https://github.com/zingerlittlebee/server_bee-backend/issues/new)

# Release Notes
SEE [CHANGELOG](CHANGELOG.md)

# Read More
[Office Website](https://serverbee.app/)

[Document](https://docs.serverbee.app/en/)

[App Store](https://apps.apple.com/us/app/serverbee/id6443553714)
