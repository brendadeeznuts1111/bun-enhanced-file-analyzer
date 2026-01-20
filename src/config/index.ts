/**
 * Main Configuration with HMR Support
 * Bun v1.3.6+ Enhanced File Analyzer Configuration
 */

import type { Config } from "./types";
import { initConfigHMR, handleThemeHMR, handleFeaturesHMR } from "./hmr";

// Export configuration for HMR
export const config: Config = {
  name: "bun-enhanced-file-analyzer",
  version: "1.3.6+",
  description: "Production-ready Bun v1.3.6+ Enhanced File Analyzer",
  
  // Build configuration
  build: {
    target: "browser",
    reactFastRefresh: true,
    metafile: true,
    sourcemap: "external",
    minify: false,
  },
  
  // Virtual files configuration
  virtualFiles: {
    enabled: true,
    theme: {
      primary: "hsl(210, 90%, 55%)",
      success: "hsl(145, 63%, 42%)",
      warning: "hsl(25, 85%, 55%)",
      error: "hsl(0, 75%, 60%)",
      info: "hsl(195, 85%, 55%)",
    },
    buildInfo: {
      includeBundleSize: true,
      includeCommitSha: true,
      includeTimestamp: true,
    },
  },
  
  // Performance settings
  performance: {
    responseJsonOptimization: true,
    colorConversionCache: true,
    archiveCompression: "gzip",
  },
  
  // Cross-compilation targets
  targets: [
    "bun-darwin-arm64",
    "bun-linux-x64", 
    "bun-windows-x64",
  ],
  
  // Features enabled
  features: [
    "virtual-files",
    "react-fast-refresh", 
    "cross-compilation",
    "metafile-analysis",
    "wcag-colors",
    "response-json-optimization",
    "bun-archive",
    "bun-color",
    "bun-jsonc",
    "config-hmr", // Add HMR feature
  ],
};

// Initialize HMR for configuration
if (import.meta.hot) {
  // Store previous state for comparison
  let previousConfig = { ...config };
  
  // Accept HMR updates
  import.meta.hot.accept(() => {
    console.log("🔥 Config HMR: Accepting configuration update");
    
    // Handle theme changes
    handleThemeHMR(previousConfig.virtualFiles?.theme, config.virtualFiles?.theme);
    
    // Handle feature changes
    handleFeaturesHMR(previousConfig.features || [], config.features || []);
    
    // Update previous config for next comparison
    previousConfig = { ...config };
    
    // Notify HMR system
    initConfigHMR(config);
  });
  
  // Handle disposal
  import.meta.hot.dispose(() => {
    console.log("🔥 Config HMR: Disposing configuration");
  });
}

// Export types
export type { Config };

// Export for HMR consumption
export default config;
