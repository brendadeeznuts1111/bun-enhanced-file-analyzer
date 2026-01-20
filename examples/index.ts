#!/usr/bin/env bun

/**
 * Examples Index
 * Central hub for all monitoring and analysis examples
 */

import { spawn } from "bun";

interface Example {
  name: string;
  description: string;
  file: string;
  category: 'monitoring' | 'analysis' | 'testing' | 'benchmarking';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  dependencies: string[];
}

const examples: Example[] = [
  {
    name: "Real-time Monitoring",
    description: "Live bundle monitoring with real-time data analysis",
    file: "realtime-monitoring.ts",
    category: "monitoring",
    difficulty: "intermediate",
    dependencies: ["fs", "path", "ws"]
  },
  {
    name: "Standalone Monitoring",
    description: "Enhanced standalone monitoring with real bundle data",
    file: "monitoring-standalone.ts",
    category: "monitoring",
    difficulty: "beginner",
    dependencies: ["fs", "path"]
  },
  {
    name: "Bundle Analyzer",
    description: "Advanced bundle analysis with optimization suggestions",
    file: "bundle-analyzer.ts",
    category: "analysis",
    difficulty: "advanced",
    dependencies: ["fs", "path", "perf_hooks"]
  },
  {
    name: "Performance Benchmark",
    description: "Comprehensive performance testing for Bun applications",
    file: "performance-benchmark.ts",
    category: "benchmarking",
    difficulty: "intermediate",
    dependencies: ["perf_hooks", "child_process"]
  },
  {
    name: "Build Comparator",
    description: "Compare different builds and analyze changes over time",
    file: "build-comparator.ts",
    category: "analysis",
    difficulty: "advanced",
    dependencies: ["fs", "path", "crypto"]
  },
  {
    name: "Test Real-time Monitoring",
    description: "Test script with sample build data generation",
    file: "test-realtime-monitoring.ts",
    category: "testing",
    difficulty: "beginner",
    dependencies: ["fs", "path"]
  }
];

class ExamplesRunner {
  async runExample(filename: string): Promise<void> {
    const example = examples.find(ex => ex.file === filename);
    
    if (!example) {
      console.error(`❌ Example not found: ${filename}`);
      console.log("Available examples:");
      this.listExamples();
      return;
    }

    console.log(`🚀 Running ${example.name}...`);
    console.log(`📝 ${example.description}`);
    console.log(`📂 Category: ${example.category} | Difficulty: ${example.difficulty}`);
    console.log("─".repeat(50));

    try {
      const process = spawn(["bun", filename], {
        stdout: "inherit",
        stderr: "inherit",
        cwd: process.cwd()
      });

      const exitCode = await process.exited;
      
      if (exitCode === 0) {
        console.log("✅ Example completed successfully");
      } else {
        console.log(`❌ Example failed with exit code: ${exitCode}`);
      }
    } catch (error) {
      console.error("❌ Failed to run example:", error);
    }
  }

  listExamples(): void {
    console.log("\n📚 Available Examples:");
    console.log("=".repeat(60));

    const categories = {
      monitoring: "🔍 Monitoring",
      analysis: "📊 Analysis", 
      testing: "🧪 Testing",
      benchmarking: "⚡ Benchmarking"
    };

    Object.entries(categories).forEach(([category, title]) => {
      const categoryExamples = examples.filter(ex => ex.category === category);
      if (categoryExamples.length > 0) {
        console.log(`\n${title}:`);
        categoryExamples.forEach((example, index) => {
          const difficulty = example.difficulty === 'beginner' ? '🟢' : 
                           example.difficulty === 'intermediate' ? '🟡' : '🔴';
          console.log(`  ${index + 1}. ${example.file} ${difficulty}`);
          console.log(`     ${example.description}`);
        });
      }
    });

    console.log("\n" + "=".repeat(60));
    console.log("Difficulty: 🟢 Beginner | 🟡 Intermediate | 🔴 Advanced");
  }

  async runAllExamples(): Promise<void> {
    console.log("🚀 Running all examples...\n");
    
    let successCount = 0;
    let failureCount = 0;

    for (const example of examples) {
      console.log(`\n📋 Running: ${example.name}`);
      console.log("─".repeat(40));
      
      try {
        const process = spawn(["bun", example.file], {
          stdout: "pipe",
          stderr: "pipe",
          cwd: process.cwd()
        });

        const [stdout, stderr] = await Promise.all([
          new Response(process.stdout).text(),
          new Response(process.stderr).text()
        ]);

        const exitCode = await process.exited;
        
        if (exitCode === 0) {
          console.log("✅ Success");
          successCount++;
        } else {
          console.log("❌ Failed");
          if (stderr) console.log("Error:", stderr.trim());
          failureCount++;
        }
      } catch (error) {
        console.log("❌ Error:", (error as Error).message);
        failureCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`📊 Results: ${successCount} successful, ${failureCount} failed`);
    
    if (failureCount > 0) {
      process.exit(1);
    }
  }

  showExampleDetails(filename: string): void {
    const example = examples.find(ex => ex.file === filename);
    
    if (!example) {
      console.error(`❌ Example not found: ${filename}`);
      return;
    }

    console.log(`📋 ${example.name}`);
    console.log("=".repeat(50));
    console.log(`📝 Description: ${example.description}`);
    console.log(`📂 Category: ${example.category}`);
    console.log(`🎯 Difficulty: ${example.difficulty}`);
    console.log(`📁 File: ${example.file}`);
    
    if (example.dependencies.length > 0) {
      console.log(`📦 Dependencies: ${example.dependencies.join(", ")}`);
    }

    console.log(`\n🚀 Run with: bun index.ts run ${example.file}`);
  }

  async checkDependencies(): Promise<void> {
    console.log("🔍 Checking example dependencies...\n");
    
    let allGood = true;
    
    for (const example of examples) {
      console.log(`📁 ${example.file}:`);
      
      const missingDeps: string[] = [];
      
      for (const dep of example.dependencies) {
        try {
          require.resolve(dep);
          console.log(`  ✅ ${dep}`);
        } catch (error) {
          console.log(`  ❌ ${dep} (missing)`);
          missingDeps.push(dep);
          allGood = false;
        }
      }
      
      if (missingDeps.length === 0) {
        console.log("  ✅ All dependencies satisfied");
      } else {
        console.log(`  ⚠️ Missing: ${missingDeps.join(", ")}`);
      }
      
      console.log("");
    }

    if (allGood) {
      console.log("✅ All examples have their dependencies satisfied");
    } else {
      console.log("⚠️ Some examples are missing dependencies");
      console.log("Install missing dependencies with: bun install");
    }
  }

  generateMarkdown(): string {
    let markdown = `# Bun Monitoring Examples

A comprehensive collection of monitoring, analysis, and testing examples for Bun applications.

## 📚 Examples

`;

    const categories = {
      monitoring: "🔍 Monitoring Examples",
      analysis: "📊 Analysis Examples",
      testing: "🧪 Testing Examples", 
      benchmarking: "⚡ Benchmarking Examples"
    };

    Object.entries(categories).forEach(([category, title]) => {
      const categoryExamples = examples.filter(ex => ex.category === category);
      if (categoryExamples.length > 0) {
        markdown += `### ${title}\n\n`;
        
        categoryExamples.forEach(example => {
          const difficulty = example.difficulty === 'beginner' ? '🟢' : 
                           example.difficulty === 'intermediate' ? '🟡' : '🔴';
          
          markdown += `#### ${difficulty} ${example.name}

\`\`\`bash
bun run ${example.file}
\`\`\`

${example.description}

**Category:** ${example.category} | **Difficulty:** ${example.difficulty}

`;
        });
      }
    });

    markdown += `## 🚀 Quick Start

### Run a specific example:
\`\`\`bash
bun index.ts run realtime-monitoring.ts
\`\`\`

### List all examples:
\`\`\`bash
bun index.ts list
\`\`\`

### Run all examples:
\`\`\`bash
bun index.ts run-all
\`\`\`

### Check dependencies:
\`\`\`bash
bun index.ts check-deps
\`\`\`

## 📋 Difficulty Levels

- 🟢 **Beginner**: Basic examples with minimal setup
- 🟡 **Intermediate**: More complex examples with additional features
- 🔴 **Advanced**: Comprehensive examples with full functionality

## 🛠️ Requirements

- Bun runtime
- Node.js filesystem access
- Network access for server examples

## 📖 Documentation

For detailed documentation, see:
- [README-Realtime-Monitoring.md](./README-Realtime-Monitoring.md)
- Individual example files contain inline documentation
`;

    return markdown;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  const runner = new ExamplesRunner();

  switch (command) {
    case 'run':
      if (args.length < 2) {
        console.error('Usage: run <example-file>');
        process.exit(1);
      }
      await runner.runExample(args[1]);
      break;

    case 'list':
      runner.listExamples();
      break;

    case 'run-all':
      await runner.runAllExamples();
      break;

    case 'details':
      if (args.length < 2) {
        console.error('Usage: details <example-file>');
        process.exit(1);
      }
      runner.showExampleDetails(args[1]);
      break;

    case 'check-deps':
      await runner.checkDependencies();
      break;

    case 'generate-docs':
      const markdown = runner.generateMarkdown();
      console.log(markdown);
      break;

    case 'help':
    default:
      console.log(`
📚 Bun Examples Runner

Usage:
  run <example-file>           Run a specific example
  list                         List all available examples
  run-all                      Run all examples
  details <example-file>       Show details for an example
  check-deps                   Check example dependencies
  generate-docs                Generate markdown documentation
  help                         Show this help

Examples:
  bun index.ts run realtime-monitoring.ts
  bun index.ts list
  bun index.ts run-all
  bun index.ts details bundle-analyzer.ts

Available examples:
${examples.map(ex => `  • ${ex.file}`).join('\n')}
      `);
  }
}

if (import.meta.main) {
  main().catch(console.error);
}

export { ExamplesRunner, type Example };
