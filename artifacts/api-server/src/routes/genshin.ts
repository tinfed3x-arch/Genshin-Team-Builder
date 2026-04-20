import { Router, type IRouter } from "express";
import { buildGenshinSnapshot } from "../lib/genshin-data";
import { logger } from "../lib/logger";

const router: IRouter = Router();

let snapshotJson: string | null = null;
let snapshotEtag: string | null = null;
let snapshotVersion: string | null = null;

const ensureSnapshot = () => {
  if (snapshotJson) return;
  const snap = buildGenshinSnapshot();
  snapshotJson = JSON.stringify(snap);
  snapshotVersion = snap.version;
  snapshotEtag = `W/"genshin-db-${snap.version}-${snapshotJson.length}"`;
  logger.info(
    { version: snap.version, bytes: snapshotJson.length },
    "Built genshin data snapshot",
  );
};

router.get("/genshin-data", (req, res) => {
  try {
    ensureSnapshot();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    if (snapshotEtag) res.setHeader("ETag", snapshotEtag);
    if (snapshotVersion) res.setHeader("X-Genshin-Db-Version", snapshotVersion);
    if (req.headers["if-none-match"] === snapshotEtag) {
      res.status(304).end();
      return;
    }
    res.send(snapshotJson);
  } catch (err) {
    logger.error({ err }, "Failed to build genshin data snapshot");
    res.status(500).json({ error: "Failed to build genshin data" });
  }
});

export default router;
