# 3x-ui LA Reality VPS 配置说明

适用场景：美国 Los Angeles VPS，3x-ui 入站使用 VLESS + TCP + Reality，客户端使用 Mihomo/Clash/Stash 订阅或手动节点。

## 文件说明

- `3x-ui-la-reality.template.json`：脱敏后的 3x-ui 入站模板，可以复制到 3x-ui 后替换占位符。
- `secrets/3x-ui-la-reality.local.json`：建议保存真实密钥和 UUID 的本地文件路径；`secrets/` 已在 `.gitignore` 中，不应提交。

## 使用步骤

1. 在 VPS 上进入 Xray 可执行文件所在环境，生成新的 UUID、Reality 密钥对和 short id。
2. 复制 `3x-ui-la-reality.template.json` 到本地 `secrets/3x-ui-la-reality.local.json`，再替换所有 `<REPLACE_...>` 占位符。
3. 在 3x-ui 面板中导入或手动同步这些字段。
4. 客户端节点需要同步使用 Vision flow、Reality public key、short id、SNI 和 fingerprint。
5. 不要把真实 UUID、private key、public key、short id、订阅地址、邮箱或 Telegram ID 写入公开文件。

## 生成命令

```bash
xray uuid
xray x25519
openssl rand -hex 8
```

`xray x25519` 会输出一对 Reality 私钥和公钥：私钥只放服务端，公钥放客户端配置。`openssl rand -hex 8` 生成 16 位十六进制 short id。

## 修改内容

| 配置项 | 原始值/状态 | 模板值/建议 | 优化目的 |
|---|---|---|---|
| `listen` | 空字符串 | `0.0.0.0` | 明确监听 IPv4 所有网卡，避免空值行为不清晰 |
| `tag` | `in-443-tcp` | `in-443-tcp-reality-la` | 标识 LA Reality 节点，便于日志和路由排查 |
| `clients[0].id` | 已暴露的 UUID | 新 UUID 占位符 | 已公开过的客户端身份不应继续使用 |
| `clients[0].flow` | 空字符串 | `xtls-rprx-vision` | VLESS + TCP + Reality 推荐搭配 Vision |
| `clients[0].limitIp` | `0` | `3` | 限制账号泄露后的并发滥用范围 |
| `clients[0].subId` | 已暴露的订阅 ID | 新 sub id 占位符 | 避免订阅标识被复用 |
| `settings.testseed` | 非必要字段 | 移除 | 保持入站配置更贴近常规 Xray/3x-ui 字段 |
| `sniffing.destOverride` | `http`, `tls`, `quic`, `fakedns` | `http`, `tls`, `quic` | 普通节点不需要 fake DNS 嗅探 |
| `sniffing.routeOnly` | 未设置 | `true` | 嗅探只用于路由判断，减少目标地址改写风险 |
| `realitySettings.privateKey` | 已暴露的私钥 | 新私钥占位符 | Reality 私钥泄露后必须轮换 |
| `realitySettings.shortIds` | 已暴露的 short id | 新 short id 占位符 | 避免旧 short id 被继续探测或复用 |
| `realitySettings.maxTimediff` | `0` | `maxTimeDiff: 120000` | 限制客户端与服务端时间差到 2 分钟 |
| `realitySettings.settings.publicKey` | 已暴露的公钥 | 新公钥占位符 | 与新私钥配套生成，客户端使用 |
| `realitySettings.settings.serverName` | 空字符串 | `www.microsoft.com` | 与 `serverNames` 保持一致，避免客户端 SNI 为空 |
| `realitySettings.settings.spiderX` | `/` | `/en-us/` | 更贴近 Microsoft 美国站路径，适合 LA 节点 |
| `target` / `serverNames` | `www.microsoft.com` | 保留 | 对美国 LA VPS 通常稳定；上线前建议在 VPS 上实测延迟和 TLS 连通性 |

## 客户端同步字段

客户端节点必须和服务端保持一致：

| 字段 | 客户端要求 |
|---|---|
| 协议 | VLESS |
| 端口 | `443` |
| 传输 | TCP |
| 安全层 | Reality |
| Flow | `xtls-rprx-vision` |
| SNI | `www.microsoft.com` |
| Fingerprint | `chrome` |
| SpiderX | `/en-us/` |
| Public key / short id | 使用新生成的值，不写入公开文档 |

## LA 节点建议

`www.microsoft.com:443` 可以先保留，但建议在 LA VPS 上测试目标站稳定性。如果连接不稳定或延迟偏高，再换成同样支持 TLS 1.3、HTTP/2、证书稳定、从 LA 访问低延迟的真实站点。
