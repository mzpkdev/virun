import { builtinModules } from "node:module"
import path from "node:path"
import { createServer, createViteRuntime, UserConfig, ViteDevServer, Plugin } from "vite"
import type { Configuration, Target } from "./configuration.js"
import { build as viteBuild } from "vite"
import { findTypeScriptFiles, resolveSourceDirectory } from "../utils/files.js"


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
                // Include all .ts and .tsx files when preserving modules
                include = [ "src/**/*.ts", "src/**/*.tsx" ]
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
                // Preserve directory structure when preserveModules is enabled
                copyDtsFiles: config.preserveModules ?? false
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
    const outputConfigs: Array<{
        format: "es" | "cjs"
        entryFileNames: string
        preserveModules?: boolean
        preserveModulesRoot?: string
        exports?: "auto" | "default" | "named" | "none"
    }> = []
    
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
    // External function: handle dependencies based on preserveModules mode
    const externalFn = (id: string) => {
        // Always externalize Node.js built-ins
        if (id.startsWith("node:") || builtinModules.includes(id)) {
            return true
        }
        
        // When preserveModules is enabled, externalize all node_modules dependencies
        // but NOT files from within the source directory (those should be processed separately)
        if (preserveModules) {
            // External if it's from node_modules (doesn't start with . or /)
            if (!id.startsWith(".") && !id.startsWith("/") && !path.isAbsolute(id)) {
                return true
            }
        }
        
        return false
    }
    
    // Check if output is within source directory
    const resolvedOutdir = path.resolve(root!, outdir!)
    const sourceDir = await resolveSourceDirectory(entry!)
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