<div align="center">

[![license](https://img.shields.io/npm/l/virun.svg)](https://github.com/mzpkdev/virun/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/virun.svg)](https://www.npmjs.com/package/virun)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![bundle size](https://img.shields.io/bundlephobia/min/virun)](https://bundlephobia.com/result?p=virun)

</div>
<br>
<br>

<p align="center">
  <p align="center">
    <strong>virun</strong> is an opinionated Vite-powered workflow tool for JavaScript and TypeScript projects <br>  
      — use single CLI that works for both <em>Node.js</em> and <em>browser</em> applications
    <br />
    <br />
    <a href="#how-to-use"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/mzpkdev/virun/issues">Report a bug</a>
    &nbsp;&nbsp;·&nbsp;&nbsp;
    <a href="https://github.com/mzpkdev/virun/issues">Request a feature</a>
  </p>
<br />
<br />

Table of Contents
------------------

* [Overview](#overview)
    * [Why virun?](#why-virun)
    * [Key Features](#key-features)
* [Getting started](#getting-started)
    * [How to install](#how-to-install)
    * [How to use](#how-to-use)
* [Commands](#commands)
* [Configuration](#configuration)
* [Examples](#examples)

Overview
---------

### Why virun?

Tired of juggling multiple build tools and configurations for different project types? Development tooling doesn't have to be complicated.  
Whether you're building a CLI tool, an HTTP server, or a modern web app, 
`virun` gives you a unified workflow — with speed, sensible defaults, and zero fuss.

You know what's best of all?  
It **works** seamlessly for **Node.js** and **browser** projects with the same commands.

### Key Features

<div align="center">

<table>
  <tbody>
    <tr>
      <td>⚡ Lightning Fast</td>
      <td>Powered by Vite for instant HMR in both Node.js and browser</td>
    </tr>
    <tr>
      <td>🎯 Zero Config</td>
      <td>Works out of the box with smart defaults, configure only when needed</td>
    </tr>
    <tr>
      <td>📦 Unified Workflow</td>
      <td>Same commands for Node.js and browser targets</td>
    </tr>
    <tr>
      <td>💙 TypeScript</td>
      <td>Full TypeScript support with automatic declaration generation</td>
    </tr>
    <tr>
      <td>🔧 Flexible Output</td>
      <td>ESM, CommonJS, or both — you choose the module format</td>
    </tr>
    <tr>
      <td>🧪 Testing Ready</td>
      <td>Vitest integration with coverage and watch mode built-in</td>
    </tr>
  </tbody>
</table>     

</div>

Getting started
----------------

`virun` abstracts away Vite configuration, providing you with simple `build`, `serve`, and `test` commands.
It handles the complexity behind the scenes — Vite for fast development, optimized bundling for production.
You just focus on writing code, and it figures out the rest.

### How to install

```shell
npm install --save-dev virun
```

Or install globally:

```shell
npm install -g virun
```

### How to use

The simplest way to get started is to just run `virun` commands with a target.
For Node.js projects, specify your entry point in `package.json` and run `build` or `serve`.
For browser projects, create an `index.html` and you're ready to go.

#### Node.js Project

Add your entry point to `package.json`:

```json
{
  "name": "my-app",
  "type": "module",
  "module": "src/index.ts"
}
```

Build for production:

```bash
virun build --target node
```

Or start the dev server with HMR:

```bash
virun serve --target node
```

> [!TIP]  
> By default, `virun` outputs ESM format (`.mjs`). Use `--module` to configure CommonJS or both formats!

Want to build both ESM and CommonJS? Just specify both formats.  
Need only CommonJS? Switch it with a flag.

And yes — you can configure it in a config file too!

```bash
# ESM only (default)
virun build --target node --module esm

# CommonJS only
virun build --target node --module cjs

# Both formats
virun build --target node --module esm cjs
```

#### Browser Project

Create an `index.html` in your project root:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

Build for production:

```bash
virun build --target browser
```

Or start the dev server with HMR:

```bash
virun serve --target browser
```

Use `virun test` to run your tests with Vitest!

```bash
# Run tests once (default)
virun test

# Watch mode
virun test --watch

# With coverage
virun test --coverage

# With UI
virun test --ui
```

Need to customize? Create a `virun.config.js` file!

```javascript
module.exports = {
    entry: "src/main.ts",
    outdir: "dist",
    port: 5173,
    module: ["esm", "cjs"],
    preserveModules: false,
    test: {
        watch: false,
        coverage: false,
        ui: false
    }
}
```

All settings in the config file can be overridden with CLI flags.

Commands
---------

### `virun build`

Build your project for production with all optimizations enabled — minification, source maps, and TypeScript declarations.

**Options:**
- `--target, -t` - Build target: `node` or `browser` (default: `node`)
- `--entry, -e` - Entry point file path (default: `src/main.ts` or from config)
- `--outdir, -o` - Output directory (default: `dist` or from config)
- `--module, -m` - Output module format(s): `esm`, `cjs`, or both (comma-separated). Only for `node` target. Default: `esm`
- `--preserve-modules, -p` - Build each file separately (library mode, like `tsc`). Preserves directory structure and outputs each `.ts` file as a separate `.js`/`.mjs` file. Only for `node` target.

**Examples:**

```bash
# Build Node.js app (ESM output, default)
virun build --target node

# Build browser app
virun build --target browser

# Build Node.js app with both ESM and CommonJS
virun build --target node --module esm cjs

# Custom entry and output
virun build --target node --entry src/cli.ts --outdir build

# Build in library mode (preserve-modules) - each file built separately
virun build --target node --preserve-modules --module esm cjs

# Build library mode with output to src directory (like tsc)
virun build --target node --preserve-modules --module esm cjs --outdir src
```

> [!NOTE]  
> **Preserve-modules mode** is useful for building libraries where you want to preserve the original file structure. Each TypeScript file is compiled separately, similar to `tsc`. This mode is ideal when you want consumers of your library to import specific files rather than a single bundled entry point.

### `virun serve`

Start development server with Hot Module Reloading for fast feedback loops.

**Options:**
- `--target, -t` - Serve target: `node` or `browser` (default: `node`)
- `--entry, -e` - Entry point file path (Node.js only, default: `src/main.ts` or from config)
- `--port, -p` - Dev server port (browser only, default: `5173` or from config)

**Examples:**

```bash
# Serve Node.js app with HMR
virun serve --target node

# Serve browser app with HMR
virun serve --target browser

# Custom port for browser
virun serve --target browser --port 3000

# Custom entry point for Node.js
virun serve --target node --entry src/server.ts
```

### `virun test`

Run tests using Vitest. Tests run once by default — use `--watch` to enable watch mode.

**Options:**
- `--watch, -w` - Run tests in watch mode (default: `false` or from config)
- `--coverage, -c` - Collect coverage information (default: `false` or from config)
- `--ui` - Start Vitest UI (default: `false` or from config)
- `--reporter, -r` - Reporter to use (default: from config if set)
- `--files, -f` - Test file patterns (comma-separated, default: from config if set)

**Examples:**

```bash
# Run tests once (default behavior)
virun test

# Run tests in watch mode
virun test --watch

# Run with coverage
virun test --coverage

# Run with UI
virun test --ui

# Run specific test file
virun test --files src/utils.test.ts

# Combine options
virun test --watch --coverage --reporter verbose
```

### `virun clean`

Remove build artifacts (similar to `tsc --build --clean`). Cleans generated files (`.js`, `.mjs`, `.d.ts` and their `.map` files) from the output directory without removing source files.

**Options:**
- `--outdir, -o` - Output directory to clean (default: `dist` or from config)

**Examples:**

```bash
# Clean default output directory (dist)
virun clean

# Clean artifacts in src directory (preserve-modules mode)
virun clean --outdir src

# Clean artifacts in custom output directory
virun clean --outdir build
```

**Behavior:**
- **When cleaning a directory with TypeScript source files** (e.g., `src` with preserve-modules): Removes only artifacts that correspond to existing `.ts`/`.tsx` source files, preserving the directory structure
- **When cleaning a separate output directory** (e.g., `dist`): Removes all build artifacts and the empty directory itself

Configuration
--------------

You can configure `virun` using a `virun.config.js` file in your project root. This allows you to set default values for common options, which can still be overridden by CLI flags.

### Configuration File

Create a `virun.config.js` file:

```javascript
module.exports = {
    entry: "src/main.ts",        // Entry point file path
    outdir: "dist",              // Output directory
    port: 5173,                  // Dev server port (browser)
    module: ["esm", "cjs"],      // Output format(s) for node: "esm", "cjs", or both
    preserveModules: false,      // Build each file separately (library mode, like tsc)
    test: {
        watch: false,            // Run tests in watch mode
        coverage: false,         // Collect coverage
        ui: false,               // Start Vitest UI
        reporter: "verbose",     // Reporter to use
        files: ["src/**/*.test.ts"] // Test file patterns
    }
}
```

**Priority Order:**
1. CLI flags (highest priority) - Always override config file
2. Config file values - Used when CLI flags are not provided
3. Default values (lowest priority) - Used when neither CLI flags nor config file values are set

### Module Format Configuration

For Node.js targets, configure the output module format to match your needs.

Output only ESM format (`.mjs`):
```javascript
module.exports = {
    module: ["esm"]
}
```

Output only CommonJS format (`.js`):
```javascript
module.exports = {
    module: ["cjs"]
}
```

Output both formats:
```javascript
module.exports = {
    module: ["esm", "cjs"]
}
```

### Preserve Modules Configuration

Enable library mode to build each file separately (similar to `tsc`), preserving directory structure:

```javascript
module.exports = {
    preserveModules: true,
    module: ["esm", "cjs"],
    outdir: "src"  // Output artifacts alongside source files
}
```

When `preserveModules` is enabled:
- Each `.ts` file is compiled separately into `.js`/`.mjs` files
- Directory structure is preserved
- Useful for libraries where consumers import specific files
- Can output artifacts to `src` directory (like `tsc`) or a separate directory

### Project Structure

```
my-project/
├── package.json          # Project metadata
├── virun.config.js       # Optional configuration file
├── src/
│   └── index.ts          # Your source code
├── dist/                 # Build output (generated)
└── index.html            # Required for browser target
```

Examples
---------

Check out the [`examples/`](./examples/) directory for complete working examples!

### Available Examples

**browser-app**  
Browser application with HTML entry point demonstrating client-side development with HMR.

**cli-app**  
Node.js CLI tool showing how to build command-line applications with hashbang support.

**http-app**  
Node.js HTTP server demonstrating server-side development with hot reloading.

All examples include `virun.config.js` files showing configuration file usage.

### Running Examples

```bash
# Browser app
cd examples/browser-app
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run tests

# CLI app
cd examples/cli-app
npm run dev          # Start with HMR
npm run build        # Build for production
npm test             # Run tests
node dist/index.js   # Run production build

# HTTP app
cd examples/http-app
npm run dev          # Start with HMR
npm run build        # Build for production
npm test             # Run tests
node dist/index.js   # Run production server
```

How It Works
-------------

### Node.js Target

- **Build**: Bundles your code and dependencies into module format(s) based on configuration:
  - ESM format: `dist/index.mjs` (default)
  - CommonJS format: `dist/index.js`
  - Both formats: `dist/index.mjs` and `dist/index.js`
- **Serve**: Uses Vite runtime to execute TypeScript directly with HMR

### Browser Target

- **Build**: Standard Vite production build from `index.html`
- **Serve**: Vite dev server with HMR

Design Decisions
-----------------

virun focuses on simplicity with smart defaults:

### Smart Defaults
- ✅ **Build Mode**: Always generates source maps, minifies output, and creates TypeScript declarations
- ✅ **Serve Mode**: No optimizations for faster development with HMR

### Core Principles
- ✅ **Configurable Module Formats**: Choose ESM (`.mjs`), CommonJS (`.js`), or both (default: ESM)
- ✅ **Bundle Everything**: All dependencies bundled (no externalization)
- ✅ **Zero Configuration**: Works out of the box with sensible defaults

Contributing
-------------

Contributions are welcome! Please feel free to submit a Pull Request.

Related Projects
-----------------

- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [cmdore](https://github.com/mzpkdev/cmdore) - CLI framework used by virun
