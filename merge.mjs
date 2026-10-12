// 自动合并 24 个公开免费订阅源 -> sub.txt (Base64, 小火箭可直接当订阅用)
// 用法: node merge.mjs   (需 Node 18+)
import { writeFile } from "node:fs/promises";

const SOURCES = [
  "https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub",
  "https://raw.githubusercontent.com/aiboboxx/v2rayfree/master/sub",
  "https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/v2ray.txt",
  "https://raw.githubusercontent.com/chengaopan/AutoMergePublicNodes/main/list.txt",
  "https://raw.githubusercontent.com/free18/v2ray/main/v.txt",
  "https://raw.githubusercontent.com/VPN-Subcription-Links/ClashX-V2Ray-TopFreeProxy/master/combine/v2ray.config.txt",
  "https://raw.githubusercontent.com/mahdibland/V2RayAggregator/master/sub/sub_merge.txt",
  "https://raw.githubusercontent.com/peasoft/NoMoreWalls/master/list.txt",
  "https://raw.githubusercontent.com/Epodonios/v2ray-configs/main/All_Configs_Sub.txt",
  "https://raw.githubusercontent.com/Barabama/FreeNodes/main/nodes/nodev2ray.txt",
  "https://raw.githubusercontent.com/snakem982/proxypool/master/source/v2ray-2.txt",
  "https://www.xrayvip.com/free.txt",
  "https://raw.githubusercontent.com/Au1rxx/free-vpn-subscriptions/master/output/v2ray-base64.txt",
  "https://raw.githubusercontent.com/0xRadikal/Free-v2ray-Configs/main/top100.txt",
  "https://raw.githubusercontent.com/MatinGhanbari/v2ray-configs/main/subscriptions/v2ray/all_sub.txt",
  "https://raw.githubusercontent.com/ALIILAPRO/v2rayNG-Config/main/sub.txt",
  "https://raw.githubusercontent.com/zhuhaiuk/free-nodes/main/nodes.txt",
  "https://raw.githubusercontent.com/MhdiTaheri/V2rayCollector/main/sub/mixbase64",
  "https://raw.githubusercontent.com/DukeMehdi/FreeList-V2ray-Configs/master/Configs/Lite-DukeMehdi-Configs.txt",
  "https://raw.githubusercontent.com/mfuu/v2ray/main/sub",
  "https://raw.githubusercontent.com/SoliSpirit/v2ray-configs/main/all_configs.txt",
  "https://raw.githubusercontent.com/iboxz/free-v2ray-collector/main/main/mix.txt",
  "https://raw.githubusercontent.com/Leon406/SubCrawler/master/sub/subs.txt",
  "https://raw.githubusercontent.com/free-nodes/v2rayfree/main/sub"
];

const PRIORITY = [10, 16, 13, 18, 17, 0, 9, 8, 14, 15, 21, 20, 19, 12, 5, 4, 3, 6, 2, 7, 1, 11, 22, 23];
const TARGET = 3000;
const URI_RE = /^(vmess|vless|trojan|ss|ssr|hysteria2|hy2|tuic):\/\//i;

function variants(u) {
  const m = /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/.exec(u);
  if (!m) return [u];
  const o = m[1], r = m[2], b = m[3], p = m[4];
  return [u,
    "https://fastly.jsdelivr.net/gh/" + o + "/" + r + "@" + b + "/" + p,
    "https://gcore.jsdelivr.net/gh/" + o + "/" + r + "@" + b + "/" + p,
    "https://cdn.jsdelivr.net/gh/" + o + "/" + r + "@" + b + "/" + p];
}
async function get(u, ms) {
  try {
    const c = new AbortController(); const t = setTimeout(() => c.abort(), ms || 25000);
    const r = await fetch(u, { signal: c.signal }); clearTimeout(t);
    if (!r.ok) return null;
    const x = await r.text();
    return x.length > 50 ? x : null;
  } catch (e) { return null; }
}
function extract(text) {
  let body = text;
  const compact = text.replace(/\s+/g, "");
  if (/^[A-Za-z0-9+/=]{100,}$/.test(compact.slice(0, 400))) {
    try { const d = Buffer.from(compact, "base64").toString("utf8"); if (d.includes("://")) body = d; } catch (e) {}
  }
  return body.split(/\r?\n/).map(l => l.trim()).filter(l => URI_RE.test(l));
}
function key(uri) {
  try {
    if (/^vmess:\/\//i.test(uri)) {
      const j = JSON.parse(Buffer.from(uri.slice(8).replace(/=+$/, ""), "base64").toString("utf8"));
      return "vmess|" + j.add + "|" + j.port + "|" + j.id;
    }
    const u = new URL(uri);
    return u.protocol + "|" + u.hostname + "|" + u.port + "|" + u.username;
  } catch (e) { return uri; }
}
async function fetchOne(src) {
  for (const u of variants(src)) { const t = await get(u); if (t) return t; }
  return null;
}
async function main() {
  const texts = [];
  for (let i = 0; i < SOURCES.length; i += 4) {
    const batch = await Promise.all(SOURCES.slice(i, i + 4).map(s => fetchOne(s)));
    batch.forEach(t => texts.push(t));
  }
  const okCount = texts.filter(Boolean).length;
  const perSource = texts.map(t => t ? extract(t) : []);
  const seen = new Set(); const ordered = [];
  for (const idx of PRIORITY) {
    const keep = [];
    for (const n of perSource[idx]) { const k = key(n); if (!seen.has(k)) { seen.add(k); keep.push(n); } }
    ordered.push(keep);
  }
  const picked = []; const cur = ordered.map(() => 0);
  for (let i = 0; i < ordered.length && picked.length < TARGET; i++) {
    const take = Math.min(125, ordered[i].length); picked.push.apply(picked, ordered[i].slice(0, take)); cur[i] = take;
  }
  while (picked.length < TARGET) {
    let prog = false;
    for (let i = 0; i < ordered.length && picked.length < TARGET; i++) {
      const take = Math.min(250, ordered[i].length - cur[i]);
      if (take > 0) { picked.push.apply(picked, ordered[i].slice(cur[i], cur[i] + take)); cur[i] += take; prog = true; }
    }
    if (!prog) break;
  }
  const list = picked.slice(0, TARGET);
  const b64 = Buffer.from(list.join("\n") + "\n", "utf8").toString("base64");
  await writeFile("sub.txt", b64, "utf8");
  const hist = {};
  for (const n of list) { const p = n.split("://")[0].toLowerCase(); hist[p] = (hist[p] || 0) + 1; }
  console.log("源成功 " + okCount + "/" + SOURCES.length + "，打包 " + list.length + " 个节点");
  console.log("协议分布: " + JSON.stringify(hist));
}
await main();
