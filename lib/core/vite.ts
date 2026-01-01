import { builtinModules } from "node:module"
import path from "node:path"
import { createServer, createViteRuntime, UserConfig, ViteDevServer, Plugin } from "vite"
import type { Configuration, Target } from "./configuration.ts"
import { build as viteBuild } from "vite"
import { findTypeScriptFiles, resolveSourceDirectory } from "../utils/files.ts"


function createEsbuildNodePlugin(): Plugin {
    return {
        name: "esbuild-node-target",
        config(config) {
            // Configure esbuild to support Node.js features like top-level await
            if (!config.esbuild) {
                config.esbuild = {}
            }
            config.esbuild.target = "node18"
            config.esbuild.platform = "node"
        },
        configResolved(config) {
            // Ensure esbuild is configured for Node.js
            if (config.esbuild) {
                config.esbuild.target = "node18"
                config.esbuild.platform = "node"
            }
        }
    }
}

async function addDtsPlugin(target: Target, viteConfig: UserConfig, config: Configuration): Promise<void> {
    const isNode = target === "node"
    try {
        const { default: dts } = await import("vite-plugin-dts")
        
        // Determine include pattern based on target and preserveModules
        let include: string[]
        if (isNode) {
            if (config.preserveModules) {
                // Resolve source directory from entry point
                const sourceDir = await resolveSourceDirectory(config.entry!)
                // Calculate relative path from project root to source directory
                const relativeSourceDir = path.relative(config.root!, sourceDir)
                // Normalize path separators for glob patterns
                // Handle case where source directory is the root (returns "." or empty)
                if (relativeSourceDir === "." || relativeSourceDir === "") {
                    include = [ "**/*.ts", "**/*.tsx" ]
                } else {
                    const sourcePattern = relativeSourceDir.replace(/\\/g, "/")
                    include = [ `${sourcePattern}/**/*.ts`, `${sourcePattern}/**/*.tsx` ]
                }
            } else {
                // Only include entry file when bundling
                include = [ config.entry! ]
            }
        } else {
            // Browser: always include all src files
            include = [ "src/**/*.ts", "src/**/*.tsx" ]
        }
        
        viteConfig.plugins?.push(
            dts({
                root: config.root,
                outDir: config.outdir,
                include,
                exclude: [ 
                    "**/*.test.ts", 
                    "**/*.test.tsx", 
                    "**/*.spec.ts", 
                    "**/*.spec.tsx", 
                    "node_modules", 
                    "dist" 
                ],
                // Generate declaration files (don't copy existing ones)
                copyDtsFiles: false,
                // Insert types entry in package.json
                insertTypesEntry: false,
                // Override compilerOptions to ensure correct output directory
                compilerOptions: {
                    declaration: true,
                    declarationMap: true,
                    outDir: path.resolve(config.root!, config.outdir!)
                }
            })
        )
    } catch {
        // DTS plugin not available, skip DTS generation
    }
}

const buildViteNodeConfiguration = async (config: Configuration): Promise<UserConfig> => {
    const { root, entry, outdir, port, module, preserveModules } = config
    
    // Determine input based on preserveModules mode
    let input: string | Record<string, string>
    
    if (preserveModules) {
        // Find all TypeScript files in the directory
        const sourceDir = await resolveSourceDirectory(entry!)
        const tsFiles = await findTypeScriptFiles(sourceDir)
        
        if (tsFiles.length === 0) {
            throw new Error(`No TypeScript files found in ${sourceDir}`)
        }
        
        // Create entry points object preserving directory structure
        input = {}
        for (const file of tsFiles) {
            const relativePath = path.relative(sourceDir, file)
            // Remove file extension and normalize path separators
            const nameWithoutExt = relativePath
                .replace(/\.tsx?$/, "")
                .replace(/\\/g, "/")
            input[nameWithoutExt] = file
        }
    } else {
        // Standard bundling mode: single entry point
        input = entry!
    }
    
    // Determine output configuration based on module formats
    const outputConfigs: any[] = []
    
    if (module!.includes("esm")) {
        outputConfigs.push({
            format: "es",
            entryFileNames: preserveModules ? "[name].mjs" : "index.mjs",
            exports: "auto",
            ...(preserveModules && {
                preserveModules: true,
                preserveModulesRoot: await resolveSourceDirectory(entry!)
            })
        })
    }
    
    if (module!.includes("cjs")) {
        outputConfigs.push({
            format: "cjs",
            entryFileNames: preserveModules ? "[name].js" : "index.js",
            exports: "auto",
            interop: "auto",
            ...(preserveModules && {
                preserveModules: true,
                preserveModulesRoot: await resolveSourceDirectory(entry!)
            })
        })
    }
    
    if (outputConfigs.length === 0) {
        throw new Error("At least one module format must be specified")
    }
    
    const output = outputConfigs.length === 1 ? outputConfigs[0] : outputConfigs
    
    // Resolve source directory for external function and later use
    const sourceDir = await resolveSourceDirectory(entry!)
    
    // Collect all entry point absolute paths to ensure they're never externalized
    const entryPointPaths = new Set<string>()
    if (preserveModules && typeof input === "object") {
        for (const filePath of Object.values(input)) {
            const absolutePath = path.resolve(filePath)
            entryPointPaths.add(absolutePath)
            // Also add normalized versions for Windows case-insensitivity
            if (process.platform === "win32") {
                entryPointPaths.add(absolutePath.toLowerCase())
            }
        }
    }
    
    // External function: handle dependencies based on preserveModules mode
    const externalFn = (id: string, importer?: string) => {
        // Always externalize Node.js built-ins
        if (id.startsWith("node:") || builtinModules.includes(id)) {
            return true
        }
        
        // NEVER externalize TypeScript declaration files - they must be bundled
        if (id.endsWith(".d.ts") || id.endsWith(".d.mts") || id.endsWith(".d.cts")) {
            return false
        }
        
        // Helper to check if an ID resolves to an entry point
        const isEntryPoint = (moduleId: string): boolean => {
            // Try to resolve the ID to an absolute path
            let resolvedPath: string | null = null
            
            if (path.isAbsolute(moduleId)) {
                resolvedPath = path.resolve(moduleId)
            } else if (moduleId.startsWith("./") || moduleId.startsWith("../")) {
                if (importer) {
                    resolvedPath = path.resolve(path.dirname(importer), moduleId)
                } else if (root) {
                    resolvedPath = path.resolve(root, moduleId)
                }
            } else if (root && !moduleId.startsWith("/")) {
                // Path relative to root (like "src/config.ts")
                resolvedPath = path.resolve(root, moduleId)
            }
            
            if (resolvedPath) {
                const normalized = path.resolve(resolvedPath)
                if (entryPointPaths.has(normalized)) {
                    return true
                }
                // Check case-insensitive on Windows
                if (process.platform === "win32" && entryPointPaths.has(normalized.toLowerCase())) {
                    return true
                }
            }
            
            return false
        }
        
        // NEVER externalize entry points themselves
        if (isEntryPoint(id)) {
            return false
        }
        
        // When preserveModules is enabled, we need to handle this differently
        if (preserveModules) {
            // Externalize node_modules (packages that don't start with . or /)
            if (!id.startsWith(".") && !id.startsWith("/") && !path.isAbsolute(id)) {
                return true
            }
            
            // When building with dual formats (both ESM and CJS), we need to externalize
            // internal imports to avoid interop issues. Each file is built separately,
            // and relative imports will be resolved at runtime.
            // This allows each module to reference others without bundling them together.
            if (module!.length > 1) {
                // Externalize relative imports (already checked they're not entry points above)
                if (id.startsWith("./") || id.startsWith("../")) {
                    return true
                }
                
                // Externalize absolute paths within source directory (if not entry points)
                if (path.isAbsolute(id)) {
                    const normalizedId = path.resolve(id)
                    const normalizedSourceDir = path.resolve(sourceDir)
                    const isInSourceDir = process.platform === "win32"
                        ? normalizedId.toLowerCase().startsWith(normalizedSourceDir.toLowerCase())
                        : normalizedId.startsWith(normalizedSourceDir)
                    
                    if (isInSourceDir) {
                        return true
                    }
                }
            }
            
            // Default: don't externalize when building single format
            return false
        }
        
        // When NOT using preserveModules (standard bundling mode)
        // Don't externalize anything - bundle everything
        return false
    }
    
    // Check if output is within source directory
    const resolvedOutdir = path.resolve(root!, outdir!)
    const isOutputInSource = resolvedOutdir.startsWith(sourceDir)
    
    const vite: UserConfig = {
        root,
        logLevel: "info",
        plugins: preserveModules ? [createEsbuildNodePlugin()] : [],
        ...(preserveModules && {
            esbuild: {
                target: "node18",
                platform: "node"
            }
        }),
        build: {
            outDir: path.resolve(root!, outdir!),
            emptyOutDir: !isOutputInSource,  // Don't delete source files
            sourcemap: true,
            // Disable minification when preserveModules is enabled (library mode)
            minify: preserveModules ? false : "esbuild",
            // Set target to support top-level await when preserveModules is enabled
            target: preserveModules ? ["node18"] : undefined,
            // Configure esbuild to support top-level await
            ...(preserveModules && {
                esbuild: {
                    target: "node18",
                    platform: "node",
                    format: "esm"
                }
            }),
            rollupOptions: {
                input,
                output,
                external: externalFn,
                ...(preserveModules && {
                    preserveEntrySignatures: "strict"
                })
            }
        },
        server: {
            port,
            middlewareMode: true,
            hmr: true
        },
        // Configure SSR for Node.js builds - needed for top-level await support
        ssr: {
            target: "node",
            ...(preserveModules ? {
                // When preserveModules is enabled, externalize dependencies (don't set noExternal)
            } : {
                // When bundling, bundle all dependencies
                noExternal: true
            })
        },
        optimizeDeps: {
            noDiscovery: true,
            include: [],
            ...(preserveModules && {
                esbuildOptions: {
                    target: "node18",
                    platform: "node"
                }
            })
        }
    }
    
    await addDtsPlugin("node", vite, config)
    return vite
}

const buildViteBrowserConfiguration = async (config: Configuration): Promise<UserConfig> => {
    const { root, outdir, port } = config
    
    // Check if output is within source directory
    const resolvedOutdir = path.resolve(root!, outdir!)
    // For browser, assume src directory
    const sourceDir = path.resolve(root!, "src")
    const isOutputInSource = resolvedOutdir.startsWith(sourceDir)
    
    const vite: UserConfig = {
        root,
        logLevel: "info",
        plugins: [],
        build: {
            outDir: path.resolve(root!, outdir!),
            emptyOutDir: !isOutputInSource,  // Don't delete source files
            sourcemap: true,
            minify: "esbuild",
            rollupOptions: {
                input: path.resolve(root!, "index.html")
            }
        },
        server: {
            port,
            open: false
        }
    }
    await addDtsPlugin("browser", vite, config)
    return vite
}

export const build = async (target: Target, configuration: Configuration) => {
    const viteConfiguration = target === "node" ?
        await buildViteNodeConfiguration(configuration) :
        await buildViteBrowserConfiguration(configuration)
    return viteBuild(viteConfiguration)
}

export const serve = async (target: Target, configuration: Configuration) => {
    const viteConfiguration = target === "node" ?
        await buildViteNodeConfiguration(configuration) :
        await buildViteBrowserConfiguration(configuration)
    let server: ViteDevServer | null = null
    try {
        server = await createServer(viteConfiguration)
        let cleanup = async () => {
            await server?.close()
            process.exit(0)
        }
        switch (target) {
            case "node":
                const runtime = await createViteRuntime(server)
                await runtime.executeUrl(configuration.entry!)
                cleanup = async () => {
                    await runtime.destroy()
                    await server?.close()
                    process.exit(0)
                }
                break
            case "browser":
                await server.listen()
                server.printUrls()
                break
        }
        process.on("SIGINT", cleanup)
        process.on("SIGTERM", cleanup)
        // Keep the process alive - wait indefinitely until cleanup signal
        await new Promise(() => {})
    } catch (error) {
        if (server) {
            await server.close()
        }
        throw error
    }
}