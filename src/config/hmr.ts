/**
 * HMR Configuration Manager
 * Handles hot module replacement for configuration files
 */

import type { Config } from "./features";

// Global config state
let currentConfig: Config | null = null;
let configListeners: Array<(config: Config) => void> = [];

/**
 * Initialize HMR for configuration
 */
export function initConfigHMR(initialConfig: Config) {
  currentConfig = initialConfig;
  
  // Notify listeners immediately when initializing
  configListeners.forEach(listener => {
    try {
      listener(initialConfig);
    } catch (error) {
      console.error("❌ Config HMR: Error in listener during init:", error);
    }
  });
  
  // Set up HMR for config changes
  if (import.meta.hot) {
    import.meta.hot.accept("./features", (newModule) => {
      if (newModule && newModule.config) {
        handleConfigUpdate(newModule.config);
      }
    });
    
    import.meta.hot.accept("./index", (newModule) => {
      if (newModule && newModule.config) {
        handleConfigUpdate(newModule.config);
      }
    });
    
    // Handle config file disposal
    import.meta.hot.dispose(() => {
      configListeners = [];
      currentConfig = null;
    });
  }
}

/**
 * Handle configuration updates from HMR
 */
function handleConfigUpdate(newConfig: Config) {
  const oldConfig = currentConfig;
  currentConfig = newConfig;
  
  // Log configuration changes
  if (import.meta.hot) {
    console.log("🔥 Config HMR: Configuration updated");
    console.log("📊 Changes detected:", getConfigChanges(oldConfig, newConfig));
  }
  
  // Notify all listeners
  configListeners.forEach(listener => {
    try {
      listener(newConfig);
    } catch (error) {
      console.error("❌ Config HMR: Error in listener:", error);
    }
  });
  
  // Update global state for React components
  if (typeof window !== 'undefined') {
    window.__CONFIG_HMR_UPDATE__ = newConfig;
    window.dispatchEvent(new CustomEvent('config-hmr-update', { 
      detail: { config: newConfig, oldConfig } 
    }));
  }
}

/**
 * Get differences between old and new config
 */
function getConfigChanges(oldConfig: Config | null, newConfig: Config): string[] {
  if (!oldConfig) return ["Initial configuration loaded"];
  
  const changes: string[] = [];
  
  // Check build configuration
  if (JSON.stringify(oldConfig.build) !== JSON.stringify(newConfig.build)) {
    changes.push("Build configuration");
  }
  
  // Check virtual files
  if (JSON.stringify(oldConfig.virtualFiles) !== JSON.stringify(newConfig.virtualFiles)) {
    changes.push("Virtual files configuration");
  }
  
  // Check performance settings
  if (JSON.stringify(oldConfig.performance) !== JSON.stringify(newConfig.performance)) {
    changes.push("Performance settings");
  }
  
  // Check theme colors
  if (JSON.stringify(oldConfig.virtualFiles?.theme) !== JSON.stringify(newConfig.virtualFiles?.theme)) {
    changes.push("Theme colors");
  }
  
  // Check features
  if (JSON.stringify(oldConfig.features) !== JSON.stringify(newConfig.features)) {
    changes.push("Feature flags");
  }
  
  return changes.length > 0 ? changes : ["Minor configuration update"];
}

/**
 * Subscribe to configuration changes
 */
export function subscribeToConfig(listener: (config: Config) => void): () => void {
  configListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    const index = configListeners.indexOf(listener);
    if (index > -1) {
      configListeners.splice(index, 1);
    }
  };
}

/**
 * Get current configuration
 */
export function getCurrentConfig(): Config | null {
  return currentConfig || null;
}

/**
 * Force configuration reload (useful for testing)
 */
export function reloadConfig() {
  if (import.meta.hot) {
    import.meta.hot.invalidate();
  }
}

/**
 * React Hook for configuration with HMR
 */
export function useConfigHMR(initialConfig: Config): [Config, (config: Config) => void] {
  const [config, setConfig] = React.useState(initialConfig);
  
  React.useEffect(() => {
    // Initialize HMR if not already done
    if (!currentConfig) {
      initConfigHMR(initialConfig);
    }
    
    // Subscribe to config changes
    const unsubscribe = subscribeToConfig(setConfig);
    
    // Listen for custom events
    const handleConfigUpdate = (event: CustomEvent) => {
      setConfig(event.detail.config);
    };
    
    window.addEventListener('config-hmr-update', handleConfigUpdate as EventListener);
    
    return () => {
      unsubscribe();
      window.removeEventListener('config-hmr-update', handleConfigUpdate as EventListener);
    };
  }, [initialConfig]);
  
  return [config, setConfig];
}

/**
 * HMR-aware config loader for development
 */
export async function loadConfigWithHMR(): Promise<Config> {
  try {
    // Import config with HMR support
    const configModule = await import("./features");
    const config = configModule.config;
    
    // Initialize HMR
    if (!currentConfig) {
      initConfigHMR(config);
    }
    
    return config;
  } catch (error) {
    console.error("❌ Config HMR: Failed to load configuration:", error);
    throw error;
  }
}

/**
 * Development-time config watcher
 */
export function watchConfig(callback: (config: Config) => void) {
  if (import.meta.hot) {
    console.log("👀 Config HMR: Watching for configuration changes...");
    
    return subscribeToConfig((config) => {
      console.log("🔄 Config HMR: Configuration changed, updating...");
      callback(config);
    });
  }
  
  return () => {}; // No-op in production
}

/**
 * Theme color HMR handler
 */
export function handleThemeHMR(oldTheme: any, newTheme: any) {
  if (JSON.stringify(oldTheme) !== JSON.stringify(newTheme)) {
    console.log("🎨 Theme HMR: Colors updated");
    
    // Update CSS custom properties
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      Object.entries(newTheme).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--theme-${key}`, value);
        }
      });
    }
  }
}

/**
 * Feature flags HMR handler
 */
export function handleFeaturesHMR(oldFeatures: string[], newFeatures: string[]) {
  const added = newFeatures.filter(f => !oldFeatures.includes(f));
  const removed = oldFeatures.filter(f => !newFeatures.includes(f));
  
  if (added.length > 0 || removed.length > 0) {
    console.log("🚀 Features HMR: Feature flags updated");
    if (added.length > 0) console.log("  ➕ Added:", added);
    if (removed.length > 0) console.log("  ➖ Removed:", removed);
  }
}

// Type declarations for global window
declare global {
  interface Window {
    __CONFIG_HMR_UPDATE__?: Config;
  }
}

// Import React for the hook
import React from "react";
