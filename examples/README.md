# virun Examples

This directory contains example projects demonstrating how to use `virun` for building and serving Node.js applications.

## Projects

### browser-app
A browser application that demonstrates building a browser app with virun.

**Features:**
- Browser application with HTML entry point
- TypeScript source code
- Entry point: `index.html`
- Includes `virun.configuration.js` with entry and outdir configuration

### http-app
A simple HTTP server application that demonstrates building a Node.js server with virun.

**Features:**
- HTTP server using Node.js built-ins
- TypeScript source code
- Entry point: `src/index.ts`
- Includes `virun.configuration.js` with entry, outdir, and port configuration

**Usage:**
```bash
cd http-app

# Development (with HMR)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run production build
node dist/index.js
```

### cli-app
A command-line application that demonstrates building a Node.js CLI tool with virun.

**Features:**
- CLI tool with argument parsing
- Reads package.json
- Hashbang preserved in output
- Entry point: `src/index.ts`
- Includes `virun.configuration.js` with entry and outdir configuration

**Usage:**
```bash
cd cli-app

# Development (with HMR)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run production build
node dist/index.js hello world
```

## Setup

These examples use npm workspaces and link to the parent `virun` package. To set up:

```bash
# From virun root directory
npm install
npm link

# Link virun to each example
cd examples/http-app && npm link virun
cd ../cli-app && npm link virun
```

## Testing virun

Both examples can be built directly using virun:

```bash
# Build HTTP app
cd examples/http-app
npx virun build --target node

# Build CLI app
cd examples/cli-app
npx virun build --target node
```

## Testing

All examples include minimal test suites to demonstrate `virun test`:

```bash
# Run tests once (default)
cd examples/cli-app
npm test

# Or run virun test directly with options
cd examples/cli-app
virun test                # Run once (default)
virun test -- --watch     # Watch mode
virun test -- --coverage  # With coverage
```

**Note:** Use `--` to separate virun arguments from Vitest arguments. The browser-app example uses jsdom for DOM testing, which is included with virun.

## Notes

- All examples use ESM (`"type": "module"` in package.json)
- Entry points are specified via `module` field in package.json or `virun.configuration.js`
- Builds output to `dist/index.js` (single bundled file)
- Tests use Vitest (included with virun)
- Browser-app tests use jsdom environment for DOM testing
- All examples include `virun.configuration.js` files demonstrating configuration file usage

