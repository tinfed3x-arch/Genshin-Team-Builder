import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from "vite-plugin-pwa";

// Suppresses benign global "error" events (ResizeObserver loop warnings,
// cross-origin "Script error.") that the runtime-error-modal plugin would
// otherwise display as opaque "(unknown runtime error)" overlays. We can't
// guarantee registration order against the plugin's injected inline script,
// so we monkey-patch window.addEventListener BEFORE any other script runs:
// any later-registered "error" listener on window is wrapped to pre-filter
// noise events. Real Errors still propagate to the overlay normally.
const earlyErrorSuppressor = (): PluginOption => ({
  name: "early-error-suppressor",
  enforce: "post",
  transformIndexHtml: {
    order: "post",
    handler: () => ({
      html: "",
      tags: [
        {
          tag: "script",
          attrs: { "data-purpose": "early-error-suppressor" },
          injectTo: "head-prepend",
          children: `(function(){
var orig=window.addEventListener;
function isNoiseError(e){
  if(typeof e.message==="string"&&e.message.indexOf("ResizeObserver loop")!==-1)return true;
  if(!(e.error instanceof Error))return true;
  return false;
}
window.addEventListener=function(type,listener,opts){
  if(type==="error"&&typeof listener==="function"){
    var wrapped=function(e){if(isNoiseError(e))return;return listener.apply(this,arguments);};
    return orig.call(this,type,wrapped,opts);
  }
  if(type==="unhandledrejection"&&typeof listener==="function"){
    var wrappedR=function(e){if(!(e.reason instanceof Error))return;return listener.apply(this,arguments);};
    return orig.call(this,type,wrappedR,opts);
  }
  return orig.call(this,type,listener,opts);
};
})();`,
        },
      ],
    }),
  },
});

// PORT is only required when running the dev or preview server. During
// `vite build` (e.g. on GitHub Actions / CI) we don't need it.
const isServerCommand = process.argv.includes("--host") ||
  process.argv.includes("dev") ||
  process.argv.includes("preview") ||
  process.argv.includes("serve");

const rawPort = process.env.PORT;

if (isServerCommand && !rawPort) {
  throw new Error(
    "PORT environment variable is required for dev/preview but was not provided.",
  );
}

const port = rawPort ? Number(rawPort) : 0;

if (rawPort && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// BASE_PATH controls the URL prefix the app is served from. Defaults to "/"
// for local dev / Replit. For static hosts that serve from a subpath
// (GitHub Pages: https://<user>.github.io/<repo>/), pass BASE_PATH=/<repo>/
// at build time. The trailing slash is required.
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    earlyErrorSuppressor(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "Genshin Team Builder",
        short_name: "Team Builder",
        description:
          "Plan your ultimate Genshin Impact party. Pick characters, weapons, and artifacts.",
        theme_color: "#0E1116",
        background_color: "#0E1116",
        display: "standalone",
        orientation: "any",
        start_url: basePath,
        scope: basePath,
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2}"],
        navigateFallback: `${basePath}index.html`,
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
