/// <reference types="bun-types" />

export const Features = {
  hmr: import.meta.hot !== undefined,
  reactFastRefresh: typeof Bun !== "undefined" && Bun.version >= "1.3.6",
  simd: typeof Buffer !== "undefined" && typeof Buffer.prototype.indexOf === "function",
  workerPool: typeof navigator !== "undefined" && (navigator.hardwareConcurrency || 0) >= 4,
  virusScan: false,
  gradients: false,
} as const;

export const WorkerPool = Features.workerPool
  ? await import("../workers/pool.ts")
  : null;
