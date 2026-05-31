# Clash VPS Config

Personal Clash/Mihomo/Stash configuration for a self-hosted 3X-UI node.

This project uses **whitelist mode**:

- China/private/Apple/iCloud traffic goes `DIRECT`
- Google/proxy-listed traffic goes `PROXY`
- Unknown traffic falls back to `PROXY`

The Stash override file is safe to publish because it does not contain the 3X-UI subscription URL.

## Files

- `stash-loyalsoldier-whitelist.stoverride`: Stash override for iOS. Use this to add Loyalsoldier whitelist rules while keeping remote nodes updated.
- `mihomo-whitelist.template.yaml`: Full Mihomo/Clash YAML template. Replace `<YOUR_3XUI_CLASH_SUBSCRIPTION_URL>` before using.
- `clash-verge-rev-whitelist.js`: Clash Verge Rev global script for desktop.

## Stash Setup

1. Import your 3X-UI Clash subscription URL into Stash as the main profile.
2. Import `stash-loyalsoldier-whitelist.stoverride` as an override.
3. Enable the override for that profile.
4. Use `Rule` mode.
5. Select your VLESS Reality node in the `PROXY` policy group.

The override does not use `#!replace`, so Stash merges the `rule-providers` and inserts these `rules` before the remote profile's existing rules. Remote node updates keep working, and remote rules are still kept as a fallback after these local rules.

## Host The Stash Override

Push this project to a GitHub repository, then use the raw override URL.

Raw URL example:

```text
https://raw.githubusercontent.com/<user>/<repo>/main/stash-loyalsoldier-whitelist.stoverride
```

Stash one-click install URL:

```text
https://link.stash.ws/install-override/raw.githubusercontent.com/<user>/<repo>/main/stash-loyalsoldier-whitelist.stoverride
```

Open the one-click URL in iPhone Safari.

## Rule Chain

```text
private -> reject -> icloud/apple DIRECT -> google/proxy PROXY
-> direct/lancidr/cncidr DIRECT -> telegramcidr PROXY
-> GEOIP LAN/CN DIRECT -> MATCH PROXY
```

## Security

Do not commit a real 3X-UI subscription URL, UUID, Reality short-id, or private node config.

Use `mihomo-whitelist.template.yaml` as a template. If you need a local full YAML with your real URL, save it as `mihomo-whitelist.local.yaml`; it is ignored by git.
