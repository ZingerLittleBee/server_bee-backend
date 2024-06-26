Language : 🇺🇸 English | [🇨🇳 简体中文](./README.zh-CN.md)

<h1 align="center">server_bee-backend</h1>

<div align="center">

Backend for iOS application named [ServerBee](https://apps.apple.com/us/app/serverbee/id6443553714)

Web-based Single-Node, Multi-Node Monitoring and Terminal Management Tools

![GitHub release (latest by date)](https://img.shields.io/github/v/release/ZingerLittleBee/server_bee-backend?style=for-the-badge)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ZingerLittleBee/server_bee-backend/release.yml?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/ZingerLittleBee/server_bee-backend?style=for-the-badge)

</div>

# Overview

Mono repository for ServerBee

- ServerHub (The hub of serverbee, provide history data from serverbee-web)
    - hub
    - serverbee-interactor
    - serverbee-recorder
- [ServerBee Backend](./web/README.md) (The backend of serverbee, can be used as a standalone application)
    - serverbee-web (provide data from server)
    - ~~serverbee-deploy (provide **AutoLaunch**、**AutoUpdate**、**DownloadWebModule** for serverbee-web)~~(Deprecated)
        - Linux use startup.sh to replace
            - `bash <(curl -s https://raw.githubusercontent.com/ZingerLittleBee/server_bee-backend/main/script/startup.sh)`
        - macOS、Windows use [ServerMilk](https://github.com/ZingerLittleBee/ServerMilk) to replace

# Documentation

#### Full documentation

- [ServerHub](docs.serverhub.app)
- [ServerBee](docs.serverbee.app)

#### View by function

- If you only want to install the **ServerBee** backend service, 👉 [Click Here](https://docs.serverbee.app/usage)
- If you just want to monitor your single server or computer through a web
  page, 👉 [Click Here](https://docs.serverbee.app/startup/web)
- If you want to monitor multiple servers or computers through a
  webpage, 👉 [Click Here](https://docs.serverhub.app)

# Snapshot

### ServerHub

TODO

### ServerBee Web

![overview](https://assets.serverbee.app/snapshots/overview.png)
![process](https://assets.serverbee.app/snapshots/process.png)
![disk&network](https://assets.serverbee.app/snapshots/disk&network.png)
![terminal](https://assets.serverbee.app/snapshots/terminal.png)
![settings](https://assets.serverbee.app/snapshots/settings.png)

# Found an issue or have a proposal

[Create an issue](https://github.com/zingerlittlebee/server_bee-backend/issues/new)

# Release Notes

SEE [CHANGELOG](CHANGELOG.md)

# Read More

[Office Website](https://serverbee.app/)

[App Store](https://apps.apple.com/us/app/serverbee/id6443553714)
