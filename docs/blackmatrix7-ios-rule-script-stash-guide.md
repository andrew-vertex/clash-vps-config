# blackmatrix7 ios_rule_script 在 Stash 中的使用说明

这份文档只整理你当前最相关的部分：`blackmatrix7/ios_rule_script` 在 Stash 里的广告拦截用法，以及下面四种资源的区别：

- `Advertising.yaml`
- `AdvertisingLite.stoverride`
- `Advertising.stoverride`
- `AdvertisingScript.stoverride`

仓库地址：

- https://github.com/blackmatrix7/ios_rule_script

## 一句话先讲清楚

这四个东西不是一类资源。

- `Advertising.yaml` 是“分流规则集”
- `AdvertisingLite.stoverride` 是“Stash rewrite/MITM 去广告规则，推荐版”
- `Advertising.stoverride` 是“Stash rewrite/MITM 去广告规则，普通版”
- `AdvertisingScript.stoverride` 是“Stash 脚本去广告规则，偏特定 App 处理”

如果你只想先稳一点地拦广告域名，用 `Advertising.yaml` 就够了。

如果你想更强地处理 App 开屏、接口广告、首页 Banner，再考虑 `AdvertisingLite.stoverride`。

## 先理解 ios_rule_script 这个仓库是干嘛的

`blackmatrix7/ios_rule_script` 不是单一规则文件，而是一整个规则仓库。里面大致分三类内容：

- `rule/`
  - 分流规则
  - 给 Clash / Mihomo / Surge / Stash 等客户端做规则匹配
- `rewrite/`
  - rewrite / MITM / URL 拦截 / 响应改写
  - 更适合做“去广告”
- `script/`
  - 针对某些 App 的脚本处理
  - 比纯规则更细，但也更依赖具体 App 的接口

对你现在的 Stash 使用场景，最常见的接法就是这三层：

1. 先用自己的主 profile 或订阅拿节点
2. 再用 override 加分流规则
3. 如果要增强去广告，再叠加 rewrite / script

## 四种资源的区别

### 1) `Advertising.yaml`

链接：

- https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Advertising/Advertising.yaml

它是什么：

- 一份规则集
- 主要包含 `DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`IP-CIDR` 等匹配项
- 用法是放进 `rule-providers:`，然后通过 `RULE-SET` 调用

典型写法：

```yaml
rule-providers:
  advertising:
    type: http
    behavior: domain
    format: yaml
    url: https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Advertising/Advertising.yaml
    path: ./ruleset/blackmatrix7/advertising.yaml
    interval: 86400

rules:
  - RULE-SET,advertising,REJECT
```

它能做什么：

- 拦截一批广告域名
- 拦截一批跟踪、统计、投放相关域名

它做不到什么：

- 不能改写 App 已经返回的内容
- 不能处理很多“广告和正常接口共用同一个域名”的场景
- 对不少开屏广告、信息流广告、首页 Banner 效果有限

优点：

- 最稳
- 最简单
- 不依赖 MITM
- 误伤相对最少

缺点：

- 去广告能力有限

适合场景：

- 先求稳
- 不想折腾 MITM
- 只想先拦一批明显广告域名

### 2) `AdvertisingLite.stoverride`

链接：

- https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rewrite/Stash/AdvertisingLite/AdvertisingLite.stoverride

它是什么：

- 一份完整的 Stash override
- 主要包含 `http:`、`rewrite:`、`mitm:` 等内容
- 属于 rewrite/MITM 去广告方案

它能做什么：

- 拦截一部分广告接口
- 改写一部分请求和响应
- 处理很多纯域名规则搞不定的广告场景

和 `Advertising.yaml` 的本质区别：

- `Advertising.yaml` 是“连不连接这个域名”
- `AdvertisingLite.stoverride` 是“这个请求发出去后，要不要拦、要不要改”

为什么叫 Lite：

- 它是相对 `Advertising.stoverride` 更克制的版本
- 上游说明里明确写了：推荐使用这个版本

注意：

- 它不是“比 `Advertising.yaml` 还轻”
- 它只是“比 `Advertising.stoverride` 更轻”

优点：

- 比纯规则集更强
- 相对完整 `Advertising` 版本更克制
- 适合大多数人作为 rewrite 去广告的第一选择

缺点：

- 需要 MITM
- 误伤概率高于纯规则集
- 某些 App 可能出现页面空白、活动页不显示、某些功能异常

适合场景：

- 你已经觉得 `Advertising.yaml` 不够用
- 你愿意开启 MITM
- 你希望更强的 App 去广告效果，但仍想控制误伤

### 3) `Advertising.stoverride`

链接：

- https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rewrite/Stash/Advertising/Advertising.stoverride

它是什么：

- 也是 Stash 的 rewrite/MITM 去广告 override

和 `AdvertisingLite.stoverride` 的区别：

- 两者数据源基本相同
- 上游说明里说，`AdvertisingLite` 会去掉一些过于宽泛的匹配，减少 MITM 数量
- 所以 `Advertising` 可以理解为更原始、更宽、更激进一些的版本

优点：

- 覆盖可能更广

缺点：

- 更容易误伤
- 更容易和其他 rewrite 重复或冲突

适合场景：

- 你已经试过 `AdvertisingLite`
- 你明确知道自己为什么还要更激进
- 你愿意接受更高的兼容性风险

### 4) `AdvertisingScript.stoverride`

链接：

- https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rewrite/Stash/AdvertisingScript/AdvertisingScript.stoverride

它是什么：

- 一份偏“脚本去广告”的 Stash override
- 除了少量规则和 rewrite 外，还会调用脚本

它的特点：

- 更偏特定 App 场景
- 不是那种“全局广覆盖”的主力方案
- 常见用途是处理某些纯规则不好处理的接口或返回内容

优点：

- 对特定 App 可能很有效

缺点：

- 通用性不如前两个 rewrite 方案
- 更依赖上游脚本是否持续维护

适合场景：

- 你针对某几个 App 有明确需求
- 你知道自己要补哪些 App 的去广告能力

## 四者对比表

| 资源 | 类型 | 主要机制 | 是否需要 MITM | 强度 | 稳定性 | 推荐用法 |
|---|---|---|---|---|---|---|
| `Advertising.yaml` | 规则集 | 域名/IP 命中后 `REJECT` | 否 | 低 | 高 | 默认起步 |
| `AdvertisingLite.stoverride` | Stash override | rewrite + MITM | 是 | 中 | 中 | 纯规则不够时优先选它 |
| `Advertising.stoverride` | Stash override | rewrite + MITM | 是 | 中高 | 中低 | 只在 Lite 不够时考虑 |
| `AdvertisingScript.stoverride` | Stash override | script + rewrite + 少量规则 | 通常是 | 定向 | 取决于脚本 | 只针对特定 App 补充 |

## 在 Stash 里怎么用

### 方案 A：只用 `Advertising.yaml`

这是最稳的方案，也是你当前仓库里已经采用的思路。

做法：

1. 在 override 里添加 `rule-providers.advertising`
2. 在 `rules:` 里加 `RULE-SET,advertising,REJECT`
3. 放在 `MATCH,PROXY` 之前

适合：

- 想先低风险试水
- 不想开 MITM

### 方案 B：叠加 `AdvertisingLite.stoverride`

做法：

1. 保留你现有的白名单 override
2. 再单独导入 `AdvertisingLite.stoverride`
3. 或者把它的内容手工合并到你自己的 override 文件
4. 在 Stash 中启用 MITM
5. 安装并信任 Stash 证书

适合：

- `Advertising.yaml` 效果不够
- 你想提升 App 去广告能力

### 方案 C：再补 `AdvertisingScript.stoverride`

做法：

1. 先有基础分流规则
2. 再有 `AdvertisingLite` 或其他 rewrite 方案
3. 最后针对个别 App 再补 `AdvertisingScript`

适合：

- 你已经定位到具体 App 还没处理好

## 推荐顺序

对你的这个项目，建议顺序很简单：

1. 先用 `Advertising.yaml`
2. 观察几天
3. 如果主要问题还是 App 开屏、信息流、首页 Banner，再考虑 `AdvertisingLite.stoverride`
4. 如果 `AdvertisingLite` 还解决不了某几个 App，再补 `AdvertisingScript.stoverride`
5. 不建议一开始就上 `Advertising.stoverride`

## 你当前仓库里应该怎么对应

你仓库里现在最适合的两档方案：

- 稳定版：
  - [stash-loyalsoldier-whitelist.stoverride](/Users/yuanjianwei/tools/proxy/clash-vps-config/stash-loyalsoldier-whitelist.stoverride)
- 稍强一点的广告拦截版：
  - [stash-loyalsoldier-whitelist-adblock.stoverride](/Users/yuanjianwei/tools/proxy/clash-vps-config/stash-loyalsoldier-whitelist-adblock.stoverride)

其中：

- `stash-loyalsoldier-whitelist-adblock.stoverride` 用的是 `Advertising.yaml`
- 不是 `AdvertisingLite.stoverride`
- 也不是 `Advertising.stoverride`

## 什么时候再考虑升级到 Lite

如果你遇到这些情况，可以考虑上 `AdvertisingLite`：

- 很多 App 开屏广告还在
- 首页轮播图、活动位还是广告
- 某些接口广告不是独立广告域名，`Advertising.yaml` 拦不住

如果你还没遇到这些痛点，就没必要急着升级。

## 风险提示

只要进入 rewrite/MITM 方案，就要接受这些现实：

- 某些 App 会误伤
- 某些活动页会消失
- 某些接口会异常
- 规则越激进，维护成本越高

所以实用原则是：

- 先上最轻的
- 不够再逐步加
- 不要一开始全量堆满

## 上游参考

- 仓库主页  
  https://github.com/blackmatrix7/ios_rule_script

- 总 README  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/README.md

- 广告规则集  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Advertising/Advertising.yaml

- Stash `AdvertisingLite`  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rewrite/Stash/AdvertisingLite/AdvertisingLite.stoverride

- Stash `Advertising`  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rewrite/Stash/Advertising/Advertising.stoverride

- Stash `AdvertisingScript`  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rewrite/Stash/AdvertisingScript/AdvertisingScript.stoverride
