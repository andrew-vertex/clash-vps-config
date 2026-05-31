// Clash Verge Rev global script
// Whitelist mode:
// - Known China/private/Apple/iCloud traffic goes DIRECT.
// - Known Google/proxy traffic goes PROXY.
// - Unknown traffic falls back to PROXY.

const RULE_BASE = "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release";

const ENABLE_REJECT = true;

const CUSTOM_DIRECT_RULES = [
  // "DOMAIN-SUFFIX,example.cn,DIRECT",
];

const CUSTOM_PROXY_RULES = [
  // "DOMAIN-SUFFIX,openai.com,PROXY",
];

function provider(name, behavior) {
  return {
    type: "http",
    behavior,
    format: "yaml",
    interval: 86400,
    url: RULE_BASE + "/" + name + ".txt",
    path: "./ruleset/loyalsoldier/" + name + ".yaml",
  };
}

function main(config) {
  const groups = config["proxy-groups"] || [];
  const hasProxyGroup = groups.some((group) => group.name === "PROXY");

  if (!hasProxyGroup) {
    const proxyNames = (config.proxies || []).map((proxy) => proxy.name).filter(Boolean);
    if (proxyNames.length > 0) {
      groups.unshift({
        name: "PROXY",
        type: "select",
        proxies: proxyNames.concat(["DIRECT"]),
      });
      config["proxy-groups"] = groups;
    }
  }

  const ruleProviders = {
    applications: provider("applications", "classical"),
    private: provider("private", "domain"),
    icloud: provider("icloud", "domain"),
    apple: provider("apple", "domain"),
    google: provider("google", "domain"),
    proxy: provider("proxy", "domain"),
    direct: provider("direct", "domain"),
    lancidr: provider("lancidr", "ipcidr"),
    cncidr: provider("cncidr", "ipcidr"),
    telegramcidr: provider("telegramcidr", "ipcidr"),
  };

  if (ENABLE_REJECT) {
    ruleProviders.reject = provider("reject", "domain");
  }

  config["rule-providers"] = {
    ...(config["rule-providers"] || {}),
    ...ruleProviders,
  };

  config.rules = [
    ...CUSTOM_DIRECT_RULES,

    "RULE-SET,applications,DIRECT",
    "DOMAIN,clash.razord.top,DIRECT",
    "DOMAIN,yacd.haishan.me,DIRECT",
    "RULE-SET,private,DIRECT",

    ...(ENABLE_REJECT ? ["RULE-SET,reject,REJECT"] : []),

    "RULE-SET,icloud,DIRECT",
    "RULE-SET,apple,DIRECT",

    ...CUSTOM_PROXY_RULES,

    "RULE-SET,google,PROXY",
    "RULE-SET,proxy,PROXY",

    "RULE-SET,direct,DIRECT",
    "RULE-SET,lancidr,DIRECT",
    "RULE-SET,cncidr,DIRECT",

    "RULE-SET,telegramcidr,PROXY,no-resolve",

    "GEOIP,LAN,DIRECT",
    "GEOIP,CN,DIRECT",

    "MATCH,PROXY",
  ];

  return config;
}
