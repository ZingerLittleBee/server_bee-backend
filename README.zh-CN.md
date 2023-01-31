Language : [🇺🇸 English](./README.md) | 🇨🇳 简体中文

<h1 align="center">server_bee-backend</h1>

<div align="center">

iOS 应用 [ServerBee](https://apps.apple.com/us/app/serverbee/id6443553714) 的后端 


![GitHub release (latest by date)](https://img.shields.io/github/v/release/ZingerLittleBee/server_bee-backend?style=for-the-badge)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ZingerLittleBee/server_bee-backend/release.yml?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/ZingerLittleBee/server_bee-backend?style=for-the-badge)

</div>

# 概述
- `web` 模块提供来自机器的数据
- `deploy` 模块提供 **开机启动**、**自动更新**、**下载 Web 模块** 的功能

![interactive install](./snapshots/interactive.gif)

# 特点

- CPU 负载
- 平均负载
- 内存使用情况
- 正常运行、启动时间
- 文件系统装载（和磁盘使用）
- 磁盘I/O统计信息
- 网络接口
- 网络流量统计
- 进程列表
- 进程详细信息
- 杀死进程
- 进程所属子进程

# 如何使用

## 安装
### Linux、MacOS

从 [Release页面](https://github.com/ZingerLittleBee/server_bee-backend/releases) 获取最新版本下载地址

```bash
# 注意根据系统架构下载对应版本
# macOS
wget https://github.com/ZingerLittleBee/server_bee-backend/releases/download/v1.1.0/serverbee-deploy-x86_64-apple-darwin.zip
unzip serverbee-deploy-x86_64-apple-darwin.zip

# Linux
wget https://github.com/ZingerLittleBee/server_bee-backend/releases/download/v1.1.0/serverbee-deploy-x86_64-unknown-linux-musl.zip
unzip serverbee-deploy-x86_64-unknown-linux-musl.zip

# 默认端口是 9527
./serverbee-deploy
```

### Windows

1. 从 [release 页面](https://github.com/ZingerLittleBee/server_bee-backend/releases) 下载最新版本 `serverbee-deploy-x86_64-pc-windows-gnu.zip`

2. 解压 serverbee-deploy-x86_64-pc-windows-gnu.zip

3. 双击启动 serverbee-deploy.exe

## 更多配置

### 交互式安装
```bash
./serverbee-deploy -i
```

### 使用自定义端口
```bash
./serverbee-deploy -p 8081
# 对于未使用 deploy 模块的用户，可以使用以下命令
./serverbee-web -p 8081
```

### 开机自启 (默认打开)
```bash
./serverbee-deploy -a true
```

### 关闭开机自启
```bash
./serverbee-deploy -a false
```

### 使用国内镜像下载
```bash
./serverbee-deploy -d
```

### 使用国外镜像下载 (Github)
```bash
./serverbee-deploy -f
```

### 例子
```bash
./serverbee-deploy -p 8081 -a false -d
```

# 如何编译
```bash
cargo build --release
```
然后你可以在 `target/release` 找到可执行文件

# 发现问题或提出建议

[创建 issue](https://github.com/zingerlittlebee/server_bee-backend/issues/new)

# 发行说明

SEE [CHANGELOG](CHANGELOG.md)
