Language : [🇺🇸 English](./README.md) | 🇨🇳 简体中文

<h1 align="center">ServerBee Backend</h1>

<div align="center">

iOS 应用 [ServerBee](https://apps.apple.com/us/app/serverbee/id6443553714) 的后端

</div>

## 特点

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

## Web 仪表盘

![overview](https://assets.serverbee.app/snapshots/overview.png)
![process](https://assets.serverbee.app/snapshots/process.png)
![disk&network](https://assets.serverbee.app/snapshots/disk&network.png)
![terminal](https://assets.serverbee.app/snapshots/terminal.png)
![settings](https://assets.serverbee.app/snapshots/settings.png)

## 交互式安装

![interactive install](https://assets.serverbee.app/snapshots/interactive.gif)

# 如何使用

## 安装

### 一键安装(Linux、macOS)

```bash
bash <(curl -s https://raw.githubusercontent.com/ZingerLittleBee/server_bee-backend/main/script/startup.sh)
```

### Docker

> 详细教程请访问文档链接 👉 [Docker](https://docs.serverbee.app/usage/docker)

```bash
docker run -d \
  -v /proc:/proc \
  --privileged=true \
  --restart unless-stopped \
  --network=host \
  --name=serverbee-web \
  zingerbee/serverbee-web -p 9527
```

### Linux、MacOS

> 👇 详细教程请访问如下文档链接
> - [Linux](https://docs.serverbee.app/usage/linux)
> - [macOS](https://docs.serverbee.app/usage/macos)

从 [Release 页面](https://github.com/ZingerLittleBee/server_bee-backend/releases) 获取最新版本下载地址

```bash
# (可选)
mkdir serverbee
cd serverbee

# 注意根据系统架构下载对应版本
# macOS
wget https://github.com/ZingerLittleBee/server_bee-backend/releases/download/v1.2.6/serverbee-deploy-x86_64-apple-darwin.zip
unzip serverbee-deploy-x86_64-apple-darwin.zip

# Linux
wget https://github.com/ZingerLittleBee/server_bee-backend/releases/download/v1.2.6/serverbee-deploy-x86_64-unknown-linux-musl.zip
unzip serverbee-deploy-x86_64-unknown-linux-musl.zip

# 默认端口是 9527
./serverbee-deploy
```

### Windows

> 详细教程请访问文档链接 👉 [Windows](https://docs.serverbee.app/usage/windows)

1. 从 [release 页面](https://github.com/ZingerLittleBee/server_bee-backend/releases)
   下载最新版本 `serverbee-deploy-x86_64-pc-windows-gnu.zip`

2. 解压 serverbee-deploy-x86_64-pc-windows-gnu.zip

3. 双击启动 serverbee-deploy.exe

## 更多配置

### 允许下载预发布版本

> 默认情况下，只会下载稳定版本
>
> 如果你想下载预发布版本，可以使用 `--pre-release` 参数

```bash
./serverbee-deploy --pre-release
```

### 交互式安装

```bash
./serverbee-deploy -i
```

### 开机自启 (默认打开)

```bash
./serverbee-deploy -a true
```

### 关闭开机自启

```bash
./serverbee-deploy -a false
```

### 使用自定义端口

```bash
./serverbee-deploy -p 8081
# 对于未使用 deploy 模块的用户，可以使用以下命令
./serverbee-web -p 8081
```

### 日志目录 (默认是当前目录)

```shell
./serverbee-web -l /var/log/serverbee
```

### 数据目录 (默认是当前目录)

```shell
./serverbee-web -d /var/lib/serverbee
```

### 例子

```bash
./serverbee-deploy -p 8081 -a false -u true
```

# 配置相关 API

以下接口只能从 `localhost` 访问

## 查看所有配置

```bash
curl http://localhost:9527/local/config
```

响应如下:

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

## 查看 `web_server` 配置

> web 服务器的相关配置，包括端口号

```bash
curl http://localhost:9527/local/config/web_server
```

响应如下:

```json
{
  "success": true,
  "data": {
    "port": 9527
  }
}
```

## 更新 `web_server` 配置

```bash
curl -X POST -H "Content-Type: application/json" -d '{"port": 9527}' http://127.0.0.1:9527/local/config/web_server
```

响应如下:

```json
{
  "success": true
}
```

## 查看 `app` 配置

> app 的相关配置，包括通讯密钥

```bash
curl http://localhost:9527/local/config/app
```

响应如下:

```json
{
  "success": true,
  "data": {
    "token": "token"
  }
}
```

## 更新 `app` 配置

```bash
curl -X POST -H "Content-Type: application/json" -d '{"token": "newToken"}' http://localhost:9527/local/config/app
```

响应如下:

```json
{
  "success": true
}
```

## 查看 `server` 配置

> server 的相关配置，包括通讯密钥、服务器地址、是否禁用 SSL

```bash
curl http://localhost:9527/local/config/server
```

响应如下:

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

## 更新 `server` 配置

```bash
curl -X POST -H "Content-Type: application/json" -d '{"token": "newToken", "host": "serverhub.app", "disable_ssl": false}' http://127.0.0.1:9527/local/config/server
```

响应如下:

```json
{
  "success": true
}
```

# 从源码编译

## 1. 构建前端源码

> 需要安装 nodejs、pnpm

```shell
pnpm -C view install
pnpm -C view build
```

构建产物在 `view/out` 目录下

## 2. 构建 web、deploy 模块源码

> 需要安装 rust

```bash
cargo build --release
```

然后你可以在 `target/release` 找到可执行文件

# 更多

[文档](https://docs.serverbee.app/)

[官网](https://serverbee.app/)

[App Store](https://apps.apple.com/us/app/serverbee/id6443553714)
