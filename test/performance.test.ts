import { describe, it, expect } from "bun:test";

describe("performance benchmarks", () => {
  it("Bun.file().bytes() 10MB", async () => {
    const start = performance.now();
    const file = Bun.file("./fixtures/10mb.bin");
    await file.bytes();
    const duration = performance.now() - start;
    console.log(`10MB read: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(100);
  });

  it("SIMD signature detection", () => {
    const bytes = new Uint8Array(10_000_000);
    const start = performance.now();
    detectFormatSIMD(bytes);
    const duration = performance.now() - start;
    console.log(`10MB signature detect: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(50);
  });

  it("Worker pool processing", async () => {
    const start = performance.now();
    const worker = new Worker("./workers/analyzer.ts");
    worker.postMessage(new File(["test"], "test.png", { type: "image/png" }));
    await new Promise(resolve => worker.onmessage = resolve);
    worker.terminate();
    const duration = performance.now() - start;
    console.log(`Worker roundtrip: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(200);
  });
});

function detectFormatSIMD(bytes: Uint8Array): string {
  const signatures: Record<string, string> = {
    "89504E47": "PNG",
    "FFD8FF": "JPEG",
    "47494638": "GIF",
    "504B0304": "ZIP",
  };
  const key = Array.from(bytes.slice(0, 4)).map(b => b.toString(16).toUpperCase()).join("");
  return signatures[key] || "Unknown";
}
