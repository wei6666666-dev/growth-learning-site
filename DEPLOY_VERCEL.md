# Growth 部署到 Vercel

Growth 是纯静态前端项目，只使用 HTML、CSS、JavaScript 和 JSON。

## 项目入口

- 首页：`index.html`
- 物理知识库：`physics.html`
- 错题本：`mistakes.html`
- 学习统计：`statistics.html`
- 物理数据：`data/physics.json`

## Vercel 路由

`vercel.json` 已配置以下访问路径：

```text
/           -> index.html
/physics    -> physics.html
/mistakes   -> mistakes.html
/statistics -> statistics.html
/stats      -> statistics.html
/math       -> index.html
```

## 从 GitHub 导入 Vercel

1. 把整个项目上传到 GitHub。
2. 打开 Vercel。
3. 点击 `Add New...` -> `Project`。
4. 选择你的 GitHub 仓库。
5. Framework Preset 选择 `Other`。
6. Build Command 留空。
7. Output Directory 留空。
8. 点击 `Deploy`。

## 常见问题

如果页面打开但物理知识库提示数据加载失败，请确认 `data/physics.json` 已上传到 GitHub，并且 Vercel 部署里没有被忽略。

如果 `/physics` 直接访问 404，请确认 `vercel.json` 在项目根目录。

如果修改后线上没有立即更新，去 Vercel 重新部署一次，或等待缓存刷新。

用户数据保存在浏览器 `localStorage` 中，换浏览器或换设备后不会自动同步。
