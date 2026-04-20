import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { bootstrapGenshinData } from "./lib/bootstrapData";

// Note: benign global "error" events (ResizeObserver loop warnings,
// cross-origin script errors) are suppressed via an inline script injected
// at the very top of <head> by the early-error-suppressor Vite plugin. It
// must run before main.tsx so it registers before the runtime-error overlay.

const mount = () => {
  createRoot(document.getElementById("root")!).render(<App />);
};

bootstrapGenshinData()
  .catch((err) => {
    console.warn("Failed to bootstrap genshin data, using bundled fallback", err);
  })
  .finally(mount);
