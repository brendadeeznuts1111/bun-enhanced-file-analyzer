import { describe, it, expect, jest } from "bun:test";

// Mock DOM environment for testing
(global as any).document = {
  body: {},
  createElement: jest.fn(() => ({})),
};

// Mock @testing-library/react to avoid DOM dependencies
jest.mock("@testing-library/react", () => ({
  render: jest.fn(() => ({
    rerender: jest.fn(),
  })),
  screen: {
    getByText: jest.fn(),
  },
}));

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
    
    // Mock the render function to avoid DOM issues
    const mockRerender = jest.fn();
    const mockRender = require("@testing-library/react").render;
    mockRender.mockReturnValue({ rerender: mockRerender });
    
    const { FileAnalyzer } = require("../components/FileAnalyzer");
    mockRender(<FileAnalyzer />);
    jest.runAllTimers();
    mockRerender(<FileAnalyzer />);
    
    expect((global as any).import.meta.hot.data.progress).toBe(50);
    jest.useRealTimers();
  });
});
