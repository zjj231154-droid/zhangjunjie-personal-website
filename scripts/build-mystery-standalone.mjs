import { build } from "vite";
import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const temporaryDirectory = path.join(root, ".mystery-standalone-tmp");
const publishDirectory = path.join(root, "publish-mystery-standalone");

if (
  path.dirname(temporaryDirectory) !== root ||
  path.basename(temporaryDirectory) !== ".mystery-standalone-tmp"
) {
  throw new Error("Refusing to use an unexpected temporary directory.");
}

await build({
  root,
  base: "./",
  plugins: [react()],
  build: {
    outDir: temporaryDirectory,
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.join(root, "mystery.html"),
      output: {
        inlineDynamicImports: true,
        entryFileNames: "game.js",
        assetFileNames: "game[extname]",
      },
    },
  },
});

const [htmlSource, scriptSource, styleSource] = await Promise.all([
  readFile(path.join(temporaryDirectory, "mystery.html"), "utf8"),
  readFile(path.join(temporaryDirectory, "game.js"), "utf8"),
  readFile(path.join(temporaryDirectory, "game.css"), "utf8"),
]);

const externalScriptTag = '<script type="module" crossorigin src="./game.js"></script>';
const externalStyleTag = '<link rel="stylesheet" crossorigin href="./game.css">';
const scriptBytes = Buffer.from(scriptSource, "utf8");
const styleBytes = Buffer.from(styleSource, "utf8");
const scriptHash = createHash("sha256").update(scriptBytes).digest("hex");
const styleHash = createHash("sha256").update(styleBytes).digest("hex");

if (!htmlSource.includes(externalScriptTag) || !htmlSource.includes(externalStyleTag)) {
  throw new Error("Vite output did not contain the expected game asset tags.");
}

const resilientLoader = `<script>
(() => {
  const maximumAttempts = 6;
  const status = document.getElementById("mystery-loading-status");
  const root = document.getElementById("mystery-root");
  const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  const assets = {
    style: {
      label: "界面样式",
      path: "./game.css",
      bytes: ${styleBytes.byteLength},
      hash: "${styleHash}",
    },
    script: {
      label: "世界记录",
      path: "./game.js",
      bytes: ${scriptBytes.byteLength},
      hash: "${scriptHash}",
    },
  };

  const sha256 = async (buffer) => {
    if (!globalThis.crypto?.subtle) return null;
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return [...new Uint8Array(digest)]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
  };

  const download = async (asset) => {
    let lastError = "网络连接中断";

    for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
      if (status) {
        status.textContent = attempt === 1
          ? "正在载入" + asset.label + "……"
          : asset.label + "连接波动，正在重试（" + attempt + "/" + maximumAttempts + "）……";
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(
          asset.path + "?v=" + asset.hash.slice(0, 12) + "&attempt=" + attempt,
          {
            cache: attempt === 1 ? "default" : "no-store",
            signal: controller.signal,
          },
        );
        if (!response.ok) throw new Error("服务器响应 " + response.status);

        const buffer = await response.arrayBuffer();
        if (buffer.byteLength !== asset.bytes) {
          throw new Error("文件不完整（" + buffer.byteLength + "/" + asset.bytes + "）");
        }

        const actualHash = await sha256(buffer);
        if (actualHash && actualHash !== asset.hash) {
          throw new Error("文件校验失败");
        }
        return buffer;
      } catch (error) {
        lastError = error?.name === "AbortError"
          ? "下载超时"
          : error instanceof Error ? error.message : String(error);
        if (attempt < maximumAttempts) {
          const delay = Math.min(750 * (2 ** (attempt - 1)), 6000) + Math.random() * 400;
          await pause(delay);
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new Error(lastError);
  };

  const startGame = async () => {
    try {
      if (!document.querySelector("style[data-mystery-game]")) {
        const styleBuffer = await download(assets.style);
        const style = document.createElement("style");
        style.dataset.mysteryGame = "true";
        style.textContent = new TextDecoder().decode(styleBuffer);
        document.head.appendChild(style);
      }

      const scriptBuffer = await download(assets.script);
      const module = document.createElement("script");
      module.type = "module";
      module.textContent = new TextDecoder().decode(scriptBuffer) + "\\n//# sourceURL=mystery-game.js";
      document.head.appendChild(module);
      return;
    } catch (error) {
      const lastError = error instanceof Error ? error.message : String(error);

      if (status) status.textContent = "连接失败：" + lastError;
      const retryButton = document.createElement("button");
      retryButton.type = "button";
      retryButton.textContent = "重新连接";
      retryButton.style.cssText = "margin-top:18px;padding:10px 18px;border:1px solid #d6a756;background:#241c12;color:#f3dfaf;cursor:pointer;font:inherit";
      retryButton.addEventListener("click", () => {
        retryButton.remove();
        startGame();
      }, { once: true });
      root?.querySelector("div > div")?.appendChild(retryButton);
    }
  };

  startGame();
})();
<\/script>`;

const standaloneHtml = htmlSource
  .replace(externalScriptTag, () => resilientLoader)
  .replace(externalStyleTag, "");

await mkdir(publishDirectory, { recursive: true });
await Promise.all([
  writeFile(path.join(publishDirectory, "index.html"), standaloneHtml, "utf8"),
  writeFile(path.join(publishDirectory, "game.js"), scriptBytes),
  writeFile(path.join(publishDirectory, "game.css"), styleBytes),
]);
await rm(temporaryDirectory, { recursive: true, force: true });

console.log(`Resilient game written to ${publishDirectory}`);
