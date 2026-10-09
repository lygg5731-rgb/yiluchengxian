# 一炉成仙

手机浏览器点开即可玩的修仙合成小游戏。

直接试玩：[一炉成仙](https://lygg5731-rgb.github.io/yiluchengxian/)

## Docker 一键启动

服务器需要先装好 Docker Engine 和 Docker Compose v2。可用 `docker --version` 和 `docker compose version` 检查；安装方式见 [Docker 官方安装说明](https://docs.docker.com/engine/install/)。Windows 或 macOS 本地试玩可使用 Docker Desktop 的 Linux 容器模式。

在服务器终端执行：

```sh
git clone https://github.com/lygg5731-rgb/yiluchengxian.git
cd yiluchengxian
docker compose up -d --build
```

然后打开 `http://服务器公网IP:8080/`。本机测试可打开 `http://localhost:8080/`。

云服务器需要在安全组和系统防火墙中允许 TCP 8080。首次构建会从 Docker Hub 拉取 Nginx 镜像，服务器需要能访问 Docker Hub；后续启动使用已构建的本地镜像。整个游戏是静态页面，不需要 Node.js、数据库或额外后端。

没有 Git 时，可以在仓库页面选择 **Code → Download ZIP**，完整解压后，在包含 `compose.yaml` 的目录执行同一条启动命令。

## 修改端口

复制 `.env.example` 为 `.env`，将 `GAME_PORT=8080` 改为需要的端口，然后重新执行：

```sh
docker compose up -d --build
```

例如 `GAME_PORT=80` 时，访问 `http://服务器公网IP/`。如果服务器已有宝塔、1Panel 或其他网站占用 80/443，请保留 8080，或改为其他空闲端口。

## 查看状态、更新和停止

```sh
docker compose ps
docker compose logs --tail=100 game
```

服务内置健康检查，正常情况下显示 `healthy`，也可访问 `/healthz` 查看 `ok`。`restart: unless-stopped` 会在 Docker 服务恢复后自动启动游戏；需确保服务器的 Docker 服务开机运行。

更新到仓库最新版本：

```sh
git pull --ff-only
docker compose build --pull
docker compose up -d
```

停止服务：

```sh
docker compose down
```

## 域名和 HTTPS

在宝塔、1Panel、Nginx 或 Caddy 中，将域名反向代理到 `http://127.0.0.1:8080/`，由面板或代理配置 HTTPS。此时可在 `.env` 中设置 `GAME_BIND_ADDRESS=127.0.0.1`，让游戏端口仅供本机代理使用。

成绩、音乐设置和图鉴保存在每位玩家的浏览器中，不在容器里。更换 IP、端口、域名或从 HTTP 改为 HTTPS 会使用另一份浏览器存档。

## 仅用 Docker 命令

没有 Compose 时，在仓库目录中执行：

```sh
docker build -t yiluchengxian:local .
docker run -d --name yiluchengxian --restart unless-stopped -p 8080:80 yiluchengxian:local
```

之后用 `docker stop yiluchengxian` 停止，用 `docker start yiluchengxian` 再次启动。

镜像使用 [官方 Nginx Alpine 镜像](https://hub.docker.com/_/nginx)，支持常见的 x86_64 和 ARM64 Linux 服务器。

## 部署验证

[Docker 测试工作流](https://github.com/lygg5731-rgb/yiluchengxian/actions/workflows/docker-smoke.yml) 会在 Linux 环境实际构建并启动容器，检查健康状态、Nginx 配置、HTML 与全部素材，再用浏览器执行触摸投放和暂停、恢复操作。
