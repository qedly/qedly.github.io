/**
 * Data the build writes before astro build: receipts (npm run fetch:receipts) and commit stats (npm run fetch:stats).
 * Both files are gitignored. A dev server without them shows no receipts and no founders' numbers; a production
 * build without the stats fails, because the founders' line must never be typed by hand.
 */
import type { Receipt } from "./receipts";
import type { Stats } from "./stats";

const receiptFiles = import.meta.glob<Receipt[]>("../data/receipts.json", { eager: true, import: "default" });
const statsFiles = import.meta.glob<Stats>("../data/stats.json", { eager: true, import: "default" });

export const RECEIPTS: Receipt[] = receiptFiles["../data/receipts.json"] ?? [];
export const STATS: Stats | undefined = statsFiles["../data/stats.json"];
if (import.meta.env.PROD && !STATS) throw new Error("src/data/stats.json is missing; run npm run fetch:stats before astro build");
