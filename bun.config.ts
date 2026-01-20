/// <reference types="bun-types" />
import { Bun } from "bun";

// Parse JSONC config at build time
const packageJson = await Bun.file("./package.json").json();

/**
 * Bun v1.3.6+ Enhanced Configuration
 * Virtual Files, Metafile Analysis, React Fast Refresh & Cross-Compilation
 */
export default {
        `;
        
        return {
          contents: refreshRuntime + contents,
          loader: args.path.endsWith(".tsx") ? "tsx" : "js",
        };
      });
    }
  },
};

const config = {
  entrypoints: ["./src/index.tsx"],
  outdir: "./public",
  target: "browser",
  format: "esm",
  splitting: true,
  minify: process.env.NODE_ENV === "production",
  sourcemap: reactFastRefresh,
  define,
  plugins: [plugin],
  loader: {
    ".svg": "dataurl",
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".gif": "file",
    ".webp": "file",
    ".tsx": "tsx",
    ".ts": "ts",
    ".jsx": "jsx",
    ".js": "js",
  },
  
  // External dependencies (don't bundle)
  external: ["react", "react-dom"],
  
  // Advanced optimizations
  treeShaking: true,
};

export default config;
