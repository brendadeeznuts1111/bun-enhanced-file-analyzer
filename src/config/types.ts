/**
 * Configuration Types
 * Type definitions for the Bun Enhanced File Analyzer configuration
 */

export interface Config {
  name: string;
  version: string;
  description: string;
  
  build: BuildConfig;
  virtualFiles: VirtualFilesConfig;
  performance: PerformanceConfig;
  targets: string[];
  features: string[];
}

export interface BuildConfig {
  target: string;
  reactFastRefresh: boolean;
  metafile: boolean;
  sourcemap: string | boolean;
  minify: boolean;
}

export interface VirtualFilesConfig {
  enabled: boolean;
  theme: ThemeConfig;
  buildInfo: BuildInfoConfig;
}

export interface ThemeConfig {
  primary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface BuildInfoConfig {
  includeBundleSize: boolean;
  includeCommitSha: boolean;
  includeTimestamp: boolean;
}

export interface PerformanceConfig {
  responseJsonOptimization: boolean;
  colorConversionCache: boolean;
  archiveCompression: string;
}

export interface ConfigHMRUpdate {
  config: Config;
  oldConfig?: Config;
  changes: string[];
}
