# Growth 本地运行说明

Growth 是纯前端本地 Web 应用，不需要后端、Node.js 或数据库。

## 推荐方式：VS Code + Live Server

1. 用 VS Code 打开本项目文件夹。
2. 安装 Live Server 插件。
3. 右键 `index.html`，选择 `Open with Live Server`。
4. 首页入口：`index.html`
5. 物理知识库入口：`physics.html`

## 备用方式：Python 本地服务器

在项目根目录打开命令行，运行：

```powershell
python -m http.server 8000 --bind 0.0.0.0
```

然后访问：

```text
http://127.0.0.1:8000/index.html
http://127.0.0.1:8000/physics.html
```

也可以直接双击：

```text
start-growth-server.bat
```

## 常见问题

如果浏览器显示“拒绝连接”，说明本地服务器没有启动，重新运行 `start-growth-server.bat` 或 Python 命令。

如果物理知识库提示“数据加载失败，请检查本地服务器是否启动”，请确认不是直接用 `file://` 打开页面，而是通过 `http://127.0.0.1:8000/` 或 Live Server 打开。

如果 8000 端口被占用，可以换一个端口：

```powershell
python -m http.server 8080 --bind 0.0.0.0
```

然后访问：

```text
http://127.0.0.1:8080/index.html
```

## 手机上访问

手机和电脑连接同一个 WiFi 后，先在电脑上查看本机 IPv4 地址：

```powershell
ipconfig
```

找到类似 `192.168.x.x` 的地址，然后在手机浏览器访问：

```text
http://电脑IPv4地址:8000/index.html
http://电脑IPv4地址:8000/physics.html
```

如果手机打不开，请允许 Windows 防火墙放行 Python，或确认手机和电脑在同一个 WiFi。
