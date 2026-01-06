<div align="center">

# virun

**Build Node.js & browser apps with one CLI. Zero config. Vite-powered.**

[![npm version](https://img.shields.io/npm/v/virun.svg)](https://www.npmjs.com/package/virun)
[![license](https://img.shields.io/npm/l/virun.svg)](https://github.com/mzpkdev/virun/blob/master/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

[Quick Start](#quick-start) · [Features](#features) · [Commands](#commands) · [Examples](#examples)

</div>

---

## Quick Start

```bash
npm install -D virun
```

**Node.js** — start coding with HMR:
```bash
virun serve --target node --entry src/index.ts
```

**Browser** — spin up the dev server:
```bash
virun serve --target browser --port 3000
```

**Build for production:**
```bash
virun build --target node --outdir dist
virun build --target browser --outdir dist
```

That's it. No config files needed.

---

## Why virun?

Building JavaScript projects usually means choosing between specialized tools — one for bundling, one for TypeScript, one for Node.js, another for the browser. Each with its own config file and learning curve.

**virun takes a different approach:**

- **One CLI for everything** — same commands work for Node.js CLIs, HTTP servers, and browser apps
- **Zero configuration** — sensible defaults that just work, configure only when you need to
- **Vite under the hood** — lightning-fast HMR, even for Node.js development

```bash
# These all work the same way
virun serve --target node      # Node.js app with HMR
virun serve --target browser   # Browser app with HMR
virun build --target node      # Production Node.js build
virun build --target browser   # Production browser build
```

---

## Features

### Unified Workflow
Same commands, any target. Switch between Node.js and browser projects without learning new tools.

### Lightning Fast
Powered by Vite with instant Hot Module Reloading — yes, even for Node.js. TypeScript runs directly in development, no compilation step.

### TypeScript First
Full TypeScript support out of the box. Automatic `.d.ts` declaration generation on build.

### Flexible Module Output
Ship ESM, CommonJS, or both. One flag, no config files:

```bash
virun build --target node --module es        # ESM only (default)
virun build --target node --module cjs       # CommonJS only
virun build --target node --module es cjs    # Both formats
```

### Library Mode
Building an npm package? Use `--preserve-modules` to compile each file separately, preserving your directory structure:

```bash
virun build --target node --preserve-modules --module es cjs
```

Your consumers can import exactly what they need:
```javascript
import { utils } from 'your-lib/utils'
import { helpers } from 'your-lib/helpers'
```

### Testing Ready
Vitest integration with watch mode:

```bash
virun test              # Run once
virun test --watch      # Watch mode
virun test --files src/utils.test.ts
```

---

## Commands

### `virun build`

Build for production with optimizations — minification, source maps, and TypeScript declarations.

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--target` | `-t` | `node` or `browser` | `node` |
| `--entry` | `-e` | Entry point file | `src/main.ts` |
| `--outdir` | `-o` | Output directory | `dist` |
| `--module` | `-m` | Output format: `es`, `cjs`, or both | `es` |
| `--preserve-modules` | | Compile files separately (library mode) | `false` |

```bash
# Examples
virun build --target node --module es cjs --outdir dist
virun build --target browser --outdir dist
virun build --target node --preserve-modules --module es cjs
```

### `virun serve`

Start development server with Hot Module Reloading.

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--target` | `-t` | `node` or `browser` | `node` |
| `--entry` | `-e` | Entry point (Node.js only) | `src/main.ts` |
| `--port` | `-p` | Dev server port (browser only) | `5173` |

```bash
# Examples
virun serve --target node --entry src/server.ts
virun serve --target browser --port 3000
```

### `virun test`

Run tests with Vitest.

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--watch` | `-w` | Watch mode | `false` |
| `--files` | `-f` | Test file patterns | all tests |

```bash
# Examples
virun test
virun test --watch
virun test --files src/utils.test.ts,src/helpers.test.ts
```

### `virun clean`

Remove build artifacts from the last build.

```bash
virun clean
```

---

## Use Cases

### CLI Tool

Build command-line applications with hashbang support:

```json
{
  "bin": "dist/index.mjs",
  "scripts": {
    "dev": "virun serve --target node --entry src/index.ts",
    "build": "virun build --target node --entry src/index.ts --outdir dist"
  }
}
```

### HTTP Server

Develop backend services with hot reloading:

```json
{
  "scripts": {
    "dev": "virun serve --target node --entry src/server.ts",
    "build": "virun build --target node --module es cjs --outdir dist"
  }
}
```

### Browser App

Standard frontend development with Vite's speed:

```json
{
  "scripts": {
    "dev": "virun serve --target browser --port 3000",
    "build": "virun build --target browser --outdir dist"
  }
}
```

### npm Library

Publish packages with proper ESM/CJS support:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.js"
    }
  },
  "scripts": {
    "build": "virun build --target node --preserve-modules --module es cjs --outdir dist"
  }
}
```

---

## Examples

Check out the [`examples/`](./examples/) directory for complete working projects:

| Example | Description |
|---------|-------------|
| **browser-app** | Browser SPA with HTML entry point and HMR |
| **cli-app** | Node.js CLI tool with hashbang support |
| **http-app** | Node.js HTTP server with hot reloading |

```bash
cd examples/cli-app
npm install
npm run dev     # Start with HMR
npm run build   # Build for production
npm test        # Run tests
```

---

## How It Works

**Node.js target:**
- **Build** — Bundles code into ESM (`.mjs`), CommonJS (`.js`), or both
- **Serve** — Uses Vite runtime to execute TypeScript directly with HMR

**Browser target:**
- **Build** — Standard Vite production build from `index.html`
- **Serve** — Vite dev server with HMR

**All builds include:** source maps, minification, TypeScript declarations.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Related

- [Vite](https://vitejs.dev/) — Next generation frontend tooling
- [cmdore](https://github.com/mzpkdev/cmdore) — CLI framework used by virun
