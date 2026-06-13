// Одоогийн машины LAN IPv4-г олж, frontend/.env.local доtorх
// VITE_API_BASE_URL-ийг автоматаар шинэчилнэ.
// `npm run dev` ажиллахаас өмнө "predev" hook-оор автоматаар дуудагдана.
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, "..", ".env.local");
const DEFAULT_PORT = "8001";

// --- Идэвхтэй LAN IPv4-г олох ---
function detectLanIp() {
  const ifaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(ifaces)) {
    for (const net of ifaces[name] || []) {
      // IPv4, дотоод биш (127.x биш), APIPA (169.254.x) биш
      const family = typeof net.family === "string" ? net.family : net.family === 4 ? "IPv4" : "";
      if (family !== "IPv4") continue;
      if (net.internal) continue;
      if (net.address.startsWith("169.254.")) continue;
      candidates.push({ name, address: net.address });
    }
  }
  // Хувийн сүлжээний (192.168.x / 10.x / 172.16-31.x) хаягийг эрэмбэлж эхэнд тавина
  const isPrivate = (ip) =>
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);
  candidates.sort((a, b) => Number(isPrivate(b.address)) - Number(isPrivate(a.address)));
  return candidates.length ? candidates[0].address : null;
}

// --- .env.local доторх одоогийн порт-г хадгалах (байхгүй бол default) ---
function readExistingPort(content) {
  const m = content.match(/VITE_API_BASE_URL\s*=\s*https?:\/\/[^:/\s]+:(\d+)/);
  return m ? m[1] : DEFAULT_PORT;
}

function main() {
  const ip = detectLanIp();
  if (!ip) {
    console.warn("[set-api-ip] LAN IPv4 олдсонгүй — .env.local-ийг хэвээр үлдээв.");
    return;
  }

  let content = "";
  try {
    content = fs.readFileSync(ENV_PATH, "utf8");
  } catch {
    content = "";
  }

  const port = readExistingPort(content);
  const newUrl = `http://${ip}:${port}/api`;
  const newLine = `VITE_API_BASE_URL=${newUrl}`;

  // Аль хэдийн зөв байвал юу ч хийхгүй
  const activeMatch = content.match(/^VITE_API_BASE_URL=.*$/m);
  if (activeMatch && activeMatch[0] === newLine) {
    console.log(`[set-api-ip] API хаяг аль хэдийн зөв: ${newUrl}`);
    return;
  }

  if (activeMatch) {
    // Идэвхтэй мөрийг солих (comment хийсэн мөрүүдийг хөндөхгүй)
    content = content.replace(/^VITE_API_BASE_URL=.*$/m, newLine);
  } else {
    // Огт байхгүй бол эхэнд нэмэх
    content = newLine + "\n" + content;
  }

  fs.writeFileSync(ENV_PATH, content, "utf8");
  console.log(`[set-api-ip] API хаягийг шинэчлэв → ${newUrl}`);
}

main();
