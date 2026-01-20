#!/usr/bin/env bun

// Simple argument parsing
const args = process.argv.slice(2);
const target = args.find(arg => arg.startsWith("--target="))?.split("=")[1] || "bun-linux-x64";
const executablePath = args.find(arg => arg.startsWith("--executable-path="))?.split("=")[1];
const output = args.find(arg => arg.startsWith("--output="))?.split("=")[1] || "./dist/file-analyzer";

console.log(`🔨 Cross-compiling for ${target}...`);

// Create CLI entry point for compilation
const cliCode = `#!/usr/bin/env bun

import { Bun } from "bun";

// CLI commands
if (process.argv.includes("--version")) {
  console.log("Bun Enhanced File Analyzer v1.3.6+");
  console.log(\`Target: \${process.env.TARGET || "unknown"}\`);
  console.log(\`Compiled: \${new Date().toISOString()}\`);
  process.exit(0);
}

if (process.argv.includes("--archive")) {
  const fileIndex = process.argv.indexOf("--archive") + 1;
  const pattern = process.argv[fileIndex];
  
  if (pattern) {
    console.log(\`Creating archive for: \${pattern}\`);
    const archive = new Bun.Archive();
    
    // Add files matching pattern
    for await (const file of Bun.glob(pattern)) {
      const contents = await Bun.file(file).bytes();
      archive.add(file, contents);
    }
    
    const archiveBytes = archive.bytes();
    await Bun.write("archive.tar.gz", archiveBytes);
    console.log(\`Archive created: archive.tar.gz (\${archiveBytes.length} bytes)\`);
  }
  process.exit(0);
}

if (process.argv.includes("--color")) {
  const colorIndex = process.argv.indexOf("--color") + 1;
  const colorSpec = process.argv[colorIndex];
  
  if (colorSpec) {
    console.log(\`Color: \${colorSpec}\`);
    console.log(\`Hex: \${Bun.color(colorSpec, "hex")}\`);
    console.log(\`RGB: \${Bun.color(colorSpec, "rgb")}\`);
    console.log(\`ANSI: \${Bun.color(colorSpec, "ansi")}\`);
  }
  process.exit(0);
}

// Default: start server
console.log("🚀 Starting Bun Enhanced File Analyzer Server...");
console.log(\`📊 Version: \${process.env.npm_package_version || "1.0.0"}\`);
console.log(\`🎯 Target: \${process.env.TARGET || "browser"}\`);
console.log(\`🔧 Compiled: \${process.env.IS_COMPILED === "true" ? "Yes" : "No"}\`);

// Import and start server
await import("../api/index.ts");
`;

// Write CLI file
await Bun.write("./src/cli.ts", cliCode);

// Build with cross-compilation
const result = await Bun.build({
  entrypoints: ["./src/cli.ts"],
  outdir: "./dist",
  
  // ✅ Compile to single executable
  compile: true,
  
  target,
  
  // ✅ Use local executable (for air-gapped environments)
  executablePath,
  
  // ✅ Include runtime files in executable
  files: {
    "./config.jsonc": await Bun.file("./config.jsonc").text(),
    "./package.json": await Bun.file("./package.json").text(),
  },
  
  // ✅ Define target-specific constants
  define: {
    "__TARGET__": JSON.stringify(target),
    "__IS_COMPILED__": "true",
    "process.env.TARGET": JSON.stringify(target),
  },
  
  // ✅ Minify for smaller executable
  minify: true,
});

if (result.success) {
  const [outputFile] = result.outputs;
  const exePath = `${output}${target.includes("windows") ? ".exe" : ""}`;
  
  // Rename to final output
  await Bun.write(exePath, await outputFile.arrayBuffer());
  
  // Make executable on Unix
  if (!target.includes("windows")) {
    await Bun.$`chmod +x ${exePath}`;
  }
  
  // Get size
  const size = (await Bun.file(exePath).size);
  
  console.log(`✅ Compiled: ${exePath} (${(size / 1024 / 1024).toFixed(2)} MB)`);
  
  // Test executable
  console.log("🧪 Testing executable...");
  
  const test = await Bun.$`${exePath} --version`.quiet();
  if (test.exitCode === 0) {
    console.log("✅ Executable works!");
    
    // Show usage
    console.log("📋 Usage:");
    console.log(`  ${exePath} --version     # Show version`);
    console.log(`  ${exePath} --archive "*.bin"    # Create archive`);
    console.log(`  ${exePath} --color "hsl(210, 90%, 55%)"  # Test colors`);
    console.log(`  ${exePath}               # Start server`);
  }
} else {
  console.error("❌ Compilation failed");
  process.exit(1);
}
