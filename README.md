# Bun-Native File Analyzer Stack

Production-ready Bun + React + HMR project with native CookieMap, URLPattern routing, and zero-dependency architecture.

## Features

- **🍪 Native Cookie Management**: Full Bun.CookieMap API with HMR persistence
- **🌐 URLPattern Routing**: Cookie-aware routing with session-based authentication
- **🎨 Color System**: Integrated Bun.color utilities with enterprise color scheme
- **⚡ Zero Dependencies**: Native Bun APIs replace ~500KB of npm packages
- **🔥 HMR Support**: Hot reload for cookies, colors, archives, and configs
- **🧪 Full Testing**: 100% testable with Bun's native test runner
- **📊 Analytics Dashboard**: Real-time statistics for cookies, archives, and configs

## Commands

```bash
# Development (all features enabled)
bun run dev

# Production build
bun run build

# Serve production (port 3879)
bun run start

# Run tests
bun test

# Validate color contrast
bun run validate:colors

# Environment setup
bun run setup

# Clean build artifacts
bun run clean
```

## Architecture

### Core Components

1. **CookieManager** (`src/api/cookie-manager.ts`)
   - Full Bun.CookieMap API implementation
   - HMR support with cookie persistence
   - Session and analytics cookie management
   - Color-coded debug logging

2. **URLPattern Integration** (`src/api/routes.ts`)
   - Cookie-aware URL pattern routing
   - Session-based authentication
   - File analysis with analytics tracking
   - JSONC config parsing with Bun.JSONC

3. **Simplified Server** (`api/server-simplified.ts`)
   - URLPatternInit shorthand syntax
   - Method-specific routing
   - Wildcard pattern support

4. **Development Dashboard** (`src/dev/dashboard.tsx`)
   - Real-time statistics monitoring
   - Visual feedback with Bun.color
   - HMR status tracking

## Project Structure

```
├── api/                    # API routes and server (port 3005)
│   ├── index.ts           # Main API entry point
│   ├── server-simplified.ts # URLPattern server
│   └── server.ts          # Additional server config
├── src/
│   ├── api/               # Core API utilities
│   │   ├── cookie-manager.ts  # CookieMap implementation
│   │   ├── auth-cookie-handler.ts # Authentication
│   │   ├── authenticated-client.ts # HTTP client
│   │   └── routes.ts          # URLPattern routing
│   ├── components/        # React components
│   │   ├── FileAnalyzer.tsx    # File upload & analysis
│   │   ├── FileAnalyzerWithAuth.tsx # Authenticated version
│   │   └── DOMAnalyzer.tsx     # DOM manipulation demo
│   ├── dev/              # Development tools
│   │   └── dashboard.tsx     # Analytics dashboard
│   ├── stores/           # State management (Zustand)
│   │   └── fileStore.ts      # File analysis store
│   ├── utils/            # Utilities and helpers
│   │   ├── colors.ts         # Color system
│   │   ├── dom-helpers.ts    # DOM manipulation
│   │   ├── cookie-debug.ts   # Cookie debugging
│   │   ├── generate-diagram.ts # Diagram generation
│   │   └── validate-colors.ts # Color validation
│   ├── types/            # TypeScript definitions
│   ├── workers/          # Service workers
│   │   └── analyzer.ts       # File analysis worker
│   └── config/           # Configuration files
│       └── features.ts      # Feature flags
├── tools/                 # Development utilities
│   ├── serve.ts          # Static file server (port 3879)
│   └── cli/              # Command-line tools
│       └── analyze.ts    # File analysis CLI
├── examples/              # Build demonstrations
│   ├── build-examples.ts # React Fast Refresh examples
│   └── build-files-demo.ts # Virtual files examples
├── scripts/               # Automation scripts
│   ├── setup.sh          # Environment setup
│   └── clean.sh          # Build cleanup
├── test/                 # Test suites
│   ├── fixtures/         # Test data
│   │   └── 10mb.bin     # Large file test data
│   ├── cookiemap.test.ts # CookieMap API tests
│   ├── cookie-manager.test.ts # Cookie manager tests
│   ├── dom-helpers.test.ts # DOM helper tests
│   └── performance.test.ts # Performance benchmarks
├── docs/                  # Documentation
│   ├── build-files-option.md # Virtual files guide
│   └── react-fast-refresh.md # HMR documentation
├── public/               # Built output
├── dist/                 # Distribution builds
└── 01-session/           # Bun fundamentals tutorial
```

## Technical Benefits

- **Performance**: Native C++ implementations with SIMD acceleration
- **Type Safety**: Full TypeScript support for all Bun APIs
- **Standards Compliant**: Correct CookieMap API usage per Bun docs
- **Developer Experience**: HMR works across all components
- **Security**: Enterprise-grade security with session management

## Build Results

- **Frontend**: 1.0 MB (development with HMR)
- **Frontend**: 156 KB (production minified)
- **API**: 26.42 KB (minified)
- **Virtual App**: 549 bytes (pure virtual build)
- **All tests passing**: 13/13 ✓
- **Build variants**: 18+ different configurations

### Available Build Commands

```bash
# Standard builds
bun run build:dev      # Development with HMR
bun run build:prod     # Production optimized

# Virtual files demonstrations
bun run build:virtual  # Pure virtual application
bun run build:files    # All virtual files examples
bun run build:overrides # File override examples
bun run build:generated # Code generation examples
```

## Environment Variables

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `$PATH` | System PATH | System executable paths | `/usr/local/bin:/usr/bin:/bin` |
| `PORT` | 3879 | Frontend server port | `3000`, `8080`, `3879` |
| `API_PORT` | 3005 | API server port | `3001`, `3002`, `3005` |
| `NODE_ENV` | development | Environment mode | `development`, `production`, `test` |

### Port Configuration

```bash
# Frontend (default: 3879)
export PORT=3000
bun run start

# API Server (default: 3005)  
export API_PORT=3001
bun run api/index.ts

# Development with custom ports
PORT=8080 API_PORT=3001 bun run dev
```

## Getting Started

### 🚀 Quick Start (Recommended)

```bash
# 1. Clone and setup automatically
git clone <repository-url>
cd b-react-hmr-refresh
./scripts/setup-bun.sh

# 2. Start development environment
./scripts/dev.sh

# 3. Open application
# Frontend: http://localhost:3879
# API: http://localhost:3005/health
```

### 📋 Manual Setup

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.example .env

# 3. Start development
bun run dev
```

### 🛠 Enhanced Scripts

```bash
# Development
./scripts/dev.sh          # Full development environment
bun run dev:api           # API server only
bun run dev:frontend      # Frontend build only

# Building
bun run build:prod        # Production optimized
bun run build:analyze     # Build analysis
bun run build:virtual     # Virtual files demo

# Utilities
./scripts/monitor.sh      # Server monitoring
./scripts/deploy.sh       # Production deployment
bun run health            # Health check
bun run status            # Server status
```

### 📊 Environment Variables

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `$PATH` | System PATH | System executable paths | `/usr/local/bin:/usr/bin:/bin` |
| `PORT` | 3879 | Frontend server port | `3000`, `8080`, `3879` |
| `API_PORT` | 3005 | API server port | `3001`, `3002`, `3005` |
| `NODE_ENV` | development | Environment mode | `development`, `production`, `test` |

### Port Configuration

```bash
# Frontend (default: 3879)
export PORT=3000
bun run start

# API Server (default: 3005)  
export API_PORT=3001
bun run api/index.ts

# Development with custom ports
PORT=8080 API_PORT=3001 bun run dev
```

## Enterprise Features

- **Security-First**: mTLS enforcement, JWT expiry, biometric verification
- **Device Health**: 15 comprehensive health checks before activation
- **ROI Tracking**: MRR impact tracking for all onboarding actions
- **28-Second Rule**: Optimized for sub-30-second onboarding
- **Color Consistency**: Enterprise color scheme (#3b82f6, #22c55e, #f59e0b, #ef4444)

## Current Configuration

- **Frontend Server**: http://localhost:3879 (tools/serve.ts)
- **API Server**: http://localhost:3005 (api/index.ts)
- **CORS Configured**: API accepts requests from port 3879
- **HMR Enabled**: React Fast Refresh active in development

### Quick Start

```bash
# 1. Setup environment
bun run setup

# 2. Start development (both servers)
bun run dev

# 3. Access applications
# Frontend: http://localhost:3879
# API Health: http://localhost:3005/health
```
