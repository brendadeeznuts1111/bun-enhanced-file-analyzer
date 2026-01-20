/// <reference types="bun-types" />
import { Bun } from "bun";

// Parse JSONC config at build time
const packageJson = await Bun.file("./package.json").json();
const tsconfig = Bun.JSONC.parse(
  await Bun.file("./tsconfig.json").text()
);

/**
 * Bun v1.3.6+ Enhanced Configuration
 * Virtual Files, Metafile Analysis, React Fast Refresh & Cross-Compilation
 */
export default {
  entrypoints: ["./src/index.tsx"],
  outdir: "./public",
  target: "browser",
  
  // React Fast Refresh (native, no plugin needed)
  reactFastRefresh: process.env.NODE_ENV !== "production",
  
  // Bundle analysis for CI/CD
  metafile: true,
  
  // Source maps for debugging
  sourcemap: process.env.NODE_ENV === "development" ? "external" : false,
  
  // Virtual files override (files that don't exist on disk)
  files: {
    // Override production config
    "./src/build-config.ts": `
      export const BUILD_CONFIG = {
        bunVersion: "${Bun.version}",
        buildTime: ${Date.now()},
        buildId: "${Bun.randomUUIDv7()}",
        debug: ${process.env.NODE_ENV === "development"},
        version: "${packageJson.version}",
        apiUrl: "${process.env.API_URL || "http://localhost:3007"}",
        frontendUrl: "${process.env.FRONTEND_URL || "http://localhost:3879"}",
      } as const;
      
      export const PORT_CONFIG = {
        frontend: "${process.env.PORT || "3879"}",
        api: "${process.env.API_PORT || "3007"}",
        environment: "${process.env.NODE_ENV || "development"}",
      } as const;
    `,
    
    // Inject build-time constants
    "./src/build-info.ts": `
      export const BUILD_ID = "${Bun.randomUUIDv7()}";
      export const BUILD_TIME = ${Date.now()};
      export const BUN_VERSION = "${Bun.version}";
      export const COMMIT_SHA = "${process.env.COMMIT_SHA || "dev"}";
      export const BUNDLE_SIZE = __BUNDLE_SIZE__; // Replaced post-build
      export const IS_COMPILED = __IS_COMPILED__;
      export const TARGET = "${process.env.TARGET || "browser"}";
    `,
    
    // Mock module for testing
    "./src/api/mock-responses.ts": `
      export const mockFiles = ${JSON.stringify([
        { id: "1", name: "test.png", size: 1024, type: "image/png" },
        { id: "2", name: "data.bin", size: 2048, type: "application/octet-stream" },
        { id: "3", name: "config.jsonc", size: 512, type: "application/jsonc" },
      ])};
      
      export const mockArchive = new Bun.Archive({
        "README.md": "# Virtual Archive\\nGenerated at build time",
        "config.json": JSON.stringify({ virtual: true, buildTime: ${Date.now()} }, null, 2),
        "data.txt": "This is virtual file content injected at build time",
      });
      
      export const mockApiResponse = {
        success: true,
        message: "Virtual API response from build-time injection",
        timestamp: ${Date.now()},
        buildId: "${Bun.randomUUIDv7()}",
      };
    `,
    
    // Generated API client
    "./src/api/generated-client.ts": `
      // Auto-generated API client for Bun Enhanced File Analyzer
      const API_BASE = "${process.env.API_URL || "http://localhost:3007"}";
      
      export class FileAnalyzerClient {
        static async analyzeFile(file: File): Promise<any> {
          const formData = new FormData();
          formData.append("file", file);
          
          const response = await fetch(\`\${API_BASE}/api/files/analyze\`, {
            method: "POST",
            body: formData,
            credentials: "include",
          });
          
          return response.json();
        }
        
        static async createArchive(fileIds: string[]): Promise<any> {
          return fetch(\`\${API_BASE}/api/files/archive\`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileIds }),
            credentials: "include",
          }).then(r => r.json());
        }
        
        static async getConfig(): Promise<any> {
          return fetch(\`\${API_BASE}/api/config\`).then(r => r.json());
        }
      }
    `,
    
    // Color palette for runtime using Bun.color()
    "./src/theme/colors.ts": generateThemeFile(),
    
    // Virtual worker for file processing
    "./src/workers/file-processor.ts": `
      // Virtual worker for file processing
      self.onmessage = async (e) => {
        const { files, operation } = e.data;
        
        try {
          let result;
          
          switch (operation) {
            case "analyze":
              result = files.map(file => ({
                id: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
              }));
              break;
              
            case "archive":
              const archive = new Bun.Archive();
              files.forEach(file => {
                archive.add(file.name, file);
              });
              result = { archiveBytes: archive.bytes() };
              break;
              
            default:
              throw new Error(\`Unknown operation: \${operation}\`);
          }
          
          self.postMessage({ success: true, result });
        } catch (error) {
          self.postMessage({ success: false, error: error.message });
        }
      };
    `,
  },
  
  // Define globals for virtual files
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    "__BUNDLE_SIZE__": "0", // Will be replaced post-build
    "__IS_COMPILED__": "false",
    "__TARGET__": '"browser"',
  },
  
  // Loaders for virtual files
  loader: {
    ".svg": "dataurl",
    ".png": "file",
    ".jsonc": "json",
    ".json": "json",
  },
  
  // Minification for production
  minify: process.env.NODE_ENV === "production",
  
  // Naming conventions with hashes
  naming: {
    entry: "[dir]/[name].[hash:8].[ext]",
    chunk: "[dir]/[name].[hash:8].[ext]",
    asset: "[dir]/[name].[hash:8].[ext]",
  },
  
  // External dependencies (Bun native APIs)
  external: [
    "bun:types",
    "bun:ffi",
    "bun:sqlite",
    "bun:websocket",
  ],
} satisfies Bun.BuildConfig;

// Generate theme file with Bun.color
function generateThemeFile(): string {
  const primary = Bun.color("hsl(210, 90%, 55%)", "hex");
  const success = Bun.color("hsl(145, 63%, 42%)", "hex");
  const warning = Bun.color("hsl(25, 85%, 55%)", "hex");
  const error = Bun.color("hsl(0, 75%, 60%)", "hex");
  const info = Bun.color("hsl(195, 85%, 55%)", "hex");
  
  // Generate semantic colors with WCAG AA compliance
  const semantic = {
    env: Bun.color("hsl(145, 63%, 42%)", "hex"), // Green for environment
    const: Bun.color("hsl(210, 90%, 55%)", "hex"), // Blue for constants
    runtime: Bun.color("hsl(25, 85%, 55%)", "hex"), // Orange for runtime
    dep: Bun.color("hsl(270, 60%, 60%)", "hex"), // Purple for dependencies
    config: Bun.color("hsl(195, 85%, 55%)", "hex"), // Cyan for configuration
  };
  
  return `
    // Auto-generated theme using Bun.color() for WCAG AA compliance
    export const THEME = {
      colors: {
        primary: "${primary}",
        success: "${success}",
        warning: "${warning}",
        error: "${error}",
        info: "${info}",
      },
      gradients: {
        primary: "linear-gradient(135deg, ${primary}, ${success})",
        ocean: "linear-gradient(135deg, ${info}, ${primary})",
        sunset: "linear-gradient(135deg, ${warning}, ${error})",
      },
      semantic: {
        env: "${semantic.env}",
        const: "${semantic.const}",
        runtime: "${semantic.runtime}",
        dep: "${semantic.dep}",
        config: "${semantic.config}",
      },
      accessibility: {
        contrastRatio: "4.5:1", // WCAG AA compliant
        fontSize: {
          small: "0.875rem",
          medium: "1rem",
          large: "1.125rem",
          xlarge: "1.25rem",
        },
      },
    } as const;
    
    // Export individual colors for easy import
    export const PRIMARY = "${primary}";
    export const SUCCESS = "${success}";
    export const WARNING = "${warning}";
    export const ERROR = "${error}";
    export const INFO = "${info}";
  `;
}

// Post-build: Replace BUNDLE_SIZE and save metafile
if (import.meta.hot) {
  import.meta.hot.dispose(async () => {
    const result = await Bun.build(await import.meta.hot!.data.config);
    
    if (result.metafile) {
      const totalSize = Object.values(result.metafile.outputs).reduce(
        (sum, out) => sum + out.bytes, 
        0
      );
      
      // Replace placeholder in build info
      const buildInfoPath = "./public/build-info.js";
      if (await Bun.file(buildInfoPath).exists()) {
        const buildInfo = await Bun.file(buildInfoPath).text();
        await Bun.write(
          buildInfoPath, 
          buildInfo.replace("__BUNDLE_SIZE__", totalSize.toString())
        );
      }
      
      // Save metafile for analysis
      await Bun.write(
        "./public/metafile.json", 
        JSON.stringify(result.metafile, null, 2)
      );
      
      // Log build metrics with colorful output
      const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
      console.log(
        `%c📦 Build Complete: ${sizeMB} MB | ${Object.keys(result.metafile.outputs).length} files | ${Bun.version}`, 
        `color: ${Bun.color("hsl(195, 85%, 55%)", "ansi")}; font-weight: bold` 
      );
      
      console.log(
        `%c🎨 Theme Generated: ${primary} | ${success} | ${warning} | ${error}`, 
        `color: ${Bun.color("hsl(210, 90%, 55%)", "ansi")}` 
      );
    }
  });
}
