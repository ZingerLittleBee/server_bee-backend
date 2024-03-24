Language : [🇺🇸 English](./README.md) | 🇨🇳 简体中文

<h1 align="center">server_bee-backend</h1>

<div align="center">

iOS 应用 [ServerBee](https://apps.apple.com/us/app/serverbee/id6443553714) 的后端

<a href="https://www.producthunt.com/posts/serverbee?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-serverbee" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=378908&theme=light" alt="ServerBee - Monitor&#0032;and&#0032;manage&#0032;all&#0032;your&#0032;desktop&#0032;systems | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

![GitHub release (latest by date)](https://img.shields.io/github/v/release/ZingerLittleBee/server_bee-backend?style=for-the-badge)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ZingerLittleBee/server_bee-backend/release.yml?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/ZingerLittleBee/server_bee-backend?style=for-the-badge)

</div>

# 概述

ServerBee 的单一代码库

- ServerHub (**ServerBee** 的中心，提供来自 **serverbee-web** 的历史数据)
    - hub
    - serverbee-interactor
    - serverbee-recorder
- [ServerBee Backend](web/README.zh-CN.md) (**ServerBee** 的后端可以作为独立应用程序使用)
    - serverbee-web (模块提供来自机器的数据)
    - serverbee-deploy (模块提供 **开机启动**、**自动更新**、**下载 Web 模块** 的功能)

## 文档

#### 完整文档

- [ServerHub](docs.serverhub.app)
- [ServerBee](docs.serverbee.app)

#### 按照功能查看

- 如何你只想安装 **ServerBee** 后端服务，👉 [点击查看文档](https://docs.serverbee.app/usage)
- 如何你只想通过网页来查看你的单台服务器或电脑，👉 [点击查看文档](https://docs.serverbee.app/startup/web)
- 如果你想通过网页来监控你的多台服务器或电脑，👉 [点击查看文档](http://localhost:3000/zh-CN/getting-started/installation)

# 截图

### ServerHub

TODO

### ServerBee Web

![overview](https://assets.serverbee.app/snapshots/overview.png)
![process](https://assets.serverbee.app/snapshots/process.png)
![disk&network](https://assets.serverbee.app/snapshots/disk&network.png)
![terminal](https://assets.serverbee.app/snapshots/terminal.png)
![settings](https://assets.serverbee.app/snapshots/settings.png)

# 发现问题或提出建议

[创建 issue](https://github.com/zingerlittlebee/server_bee-backend/issues/new)

# 发行说明

[CHANGELOG](CHANGELOG.md)

# 更多

[官网](https://serverbee.app/)

[App Store](https://apps.apple.com/us/app/serverbee/id6443553714)
