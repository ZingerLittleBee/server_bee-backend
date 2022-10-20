Language : [🇺🇸 English](./README.md) | 🇨🇳 简体中文

<center>
    <h1>server_bee-backend</h1>
</center>

<div align="center">

![GitHub release (latest by date)](https://img.shields.io/github/v/release/ZingerLittleBee/server_bee-backend?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/ZingerLittleBee/server_bee-backend?style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/ZingerLittleBee/server_bee-backend/Release?style=flat-square)

</div>

# Overview
[ServerBee APP](https://github.com/ZingerLittleBee/server_bee) 的后端程序, 使用 rust 和 actix 编写

# Features

- CPU 负载
- 平均负载
- 内存使用情况
- 正常运行、启动时间
- 文件系统装载（和磁盘使用）
- 磁盘I/O统计信息
- 网络接口
- 网络流量统计

# 如何使用

## 安装
### Linux、MacOS

```bash
# 获取最新版本, 将 `latest` 替换为所需版本
wget https://github.com/ZingerLittleBee/server_bee-backend/releases/download/latest/serverbee-deploy-x86_64-apple-darwin.zip

unzip serverbee-deploy-x86_64-apple-darwin.zip

./serverbee-deploy
```

### Windows

1. 下载最新版本 [release](https://github.com/ZingerLittleBee/server_bee-backend/releases)

2. 解压 serverbee-deploy-x86_64-pc-windows-gnu.zip

3. 启动 serverbee-deploy.exe

## 使用自定义端口
```bash
./serverbee-deploy -p 8081
```

## 禁用开机启动
```bash
./serverbee-deploy -a
```


# 发行说明

SEE [CHANGELOG](CHANGELOG.md)

# 发现问题或提出建议

[创建 issue](https://github.com/zingerlittlebee/server_bee-backend/issues/new)
