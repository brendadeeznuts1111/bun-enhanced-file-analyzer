import { describe, it, expect, jest } from "bun:test";
import { render, screen } from "@testing-library/react";
import { FileAnalyzer } from "../components/FileAnalyzer";

describe("FileAnalyzer HMR", () => {
  it("preserves state during hot reload", async () => {
    jest.useFakeTimers();
    
    (global as any).import = {
      meta: {
        hot: {
          data: { progress: 50 },
          accept: jest.fn(),
          dispose: jest.fn(),
        },
      },
    };
    
    const { rerender } = render(<FileAnalyzer />);
    jest.runAllTimers();
    rerender(<FileAnalyzer />);
    
    expect((global as any).import.meta.hot.data.progress).toBe(50);
    jest.useRealTimers();
  });
});
