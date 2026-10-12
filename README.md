# 免费订阅自动合并（24 源 → 一条订阅链接）

本仓库由 **GitHub Actions 自动维护**：每 6 小时抓取 24 个公开免费节点源，合并、去重后生成 `sub.txt`（Base64，小火箭 / Shadowrocket 可直接当订阅）。

## 订阅地址

把下面链接里的 `<用户名>` 换成你的 GitHub 用户名：

```
https://raw.githubusercontent.com/<用户名>/free-sub-auto/main/sub.txt
```

国内打不开 raw 时加镜像前缀：

```
https://ghfast.top/https://raw.githubusercontent.com/<用户名>/free-sub-auto/main/sub.txt
```

## 手动更新

- **小火箭**：首页下拉刷新，或在该订阅上左滑点「更新」
- **立刻重新合并**：Actions → 自动合并免费订阅源 → Run workflow

## 可调参数

| 文件 | 参数 | 说明 |
|---|---|---|
| `merge.mjs` | `TARGET` | 打包节点数上限（默认 3000，改小手机更流畅） |
| `merge.mjs` | `SOURCES` | 节点源列表，一行一个 |
| `.github/workflows/auto-merge.yml` | `cron` | 自动更新频率，默认每 6 小时 |

## 说明

节点全部来自 GitHub 公开免费源，随时可能失效；**请勿用于网银、邮箱等敏感账号**。
