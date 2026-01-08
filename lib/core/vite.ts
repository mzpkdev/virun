import { builtinModules } from "module"
import { build as viteBuild, createServer, createViteRuntime, UserConfig, ViteDevServer } from "vite"
import dts from "vite-plugin-dts"
import path from "node:path"
import { RollupOutput } from "rollup"
import { Configuration, Module, Target } from "./Configuration.js"
import { Metadata } from "./Metadata.js"
import { BuildError } from "../errors.js"


export type BuildConfiguration = {
    entry: string
    module: Module[]
    outdir: string
    preserveModules: boolean
}

const build = async (target: Target, configuration: BuildConfiguration): Promise<void> => {
    const { entry, module, outdir, preserveModules } = configuration

    const build = {
        outDir: outdir,
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: (id: string) => {
                if (/^node:.*/.test(id)) {
                    return true
                }
                if (builtinModules.includes(id)) {
                    return true
                }
                if (import.meta.resolve(id).includes("node_modules")) {
                    return true
                }
                return false
            }
        }
    }

    if (target == "browser") {
        try {
            await viteBuild({
                build: {
                    ...build,
                    rollupOptions: {}
                }
            })
        } catch (error) {
            throw new BuildError("build", "Browser build failed. Check your entry point and configuration.", error)
        }
        return
    }

    const plugin = (rollupTypes: boolean) => dts({
        rollupTypes: rollupTypes,
        tsconfigPath: path.resolve(process.cwd(), "tsconfig.json"),
        afterBuild: (emitted) => {
            for (const filename of emitted.keys()) {
                const normalized = path.relative(path.basename(outdir), filename)
                output.add(path.join(outdir, normalized))
            }
        }
    })

    const output = new Set<string>()
    if (!preserveModules) {
        let chunks: RollupOutput["output"]
        try {
            const [ result ] = await viteBuild({
                plugins: [ plugin(true) ],
                build: {
                    ...build,
                    target: "node18",
                    lib: {
                        entry: entry,
                        formats: module,
                        fileName: "index"
                    }
                }
            }) as RollupOutput[]
            chunks = result.output
        } catch (error) {
            throw new BuildError("build", `Node.js build failed for entry "${entry}". Check TypeScript errors above.`, error)
        }
        for (const chunk of chunks) {
            output.add(path.join(outdir, chunk.fileName))
        }
    } else {
        for (let i = 0; i < module.length; i++) {
            const item = module[i]
            const extension = item === "es"
                ? ".mjs"
                : ".js"
            let chunks: RollupOutput["output"]
            try {
                const [ result ] = await viteBuild({
                    plugins: [ plugin(false) ],
                    build: {
                        ...build,
                        target: "node18",
                        emptyOutDir: i == 0,
                        lib: {
                            entry: entry,
                            formats: [ item ]
                        },
                        rollupOptions: {
                            ...build.rollupOptions,
                            output: {
                                format: item,
                                preserveModules: true,
                                preserveModulesRoot: "src",
                                exports: "auto",
                                entryFileNames: ({ name }) => {
                                    if (name.includes("node_modules")) {
                                        throw new BuildError("build", `Cannot include node_modules in preserved module output. External dependency detected: ${name}`)
                                    }
                                    return `[name]${extension}`
                                }
                            }
                        }
                    }
                }) as RollupOutput[]
                chunks = result.output
            } catch (error) {
                if (error instanceof BuildError) {
                    throw error
                }
                throw new BuildError("build", `Build failed for module format "${item}". Check TypeScript errors above.`, error)
            }
            for (const chunk of chunks) {
                output.add(path.join(outdir, chunk.fileName))
            }
        }
    }
    await Metadata.save({
        outdir: outdir,
        output: Array.from(output)
    })
}

export type ServeConfiguration = {
    entry: string
    port?: number
}

function setupFileWatcher(
    server: ViteDevServer,
    onReload: () => Promise<void>
): void {
    let reloadTimeout: NodeJS.Timeout | null = null
    const DEBOUNCE_DELAY = 100 // ms

    server.watcher.on('change', (file: string) => {
        if (reloadTimeout) {
            clearTimeout(reloadTimeout)
        }

        reloadTimeout = setTimeout(async () => {
            const relativeFile = path.relative(process.cwd(), file)
            console.log(`\n🔄 File changed: ${relativeFile}`)

            await onReload()

            reloadTimeout = null
        }, DEBOUNCE_DELAY)
    })
}

const serve = async (target: Target, { entry, port }: ServeConfiguration): Promise<void> => {
    const viteConfiguration: UserConfig = {
        root: process.cwd(),
        cacheDir: path.join(process.cwd(), "node_modules/.vite"),
        server: {
            port,
            cors: true,
            fs: {
                cachedChecks: true,
                strict: false
            },
            preTransformRequests: true,
            warmup: {
                clientFiles: [
                    "./src/**/*.ts",
                    "./src/**/*.tsx",
                    "./index.html"
                ]
            },
            hmr: {
                overlay: true
            },
            watch: {
                usePolling: true,
                interval: 100
            }
        },
        optimizeDeps: {
            include: [],
            exclude: [ "vitest", "virun" ],
            holdUntilCrawlEnd: false,
            esbuildOptions: {
                target: "es2022",
                supported: {
                    "top-level-await": true
                }
            }
        },
        esbuild: {
            target: "es2022",
            logLevel: "error",
            keepNames: true,
            drop: []
        },
        build: {
            target: "es2022",
            sourcemap: "inline",
            minify: false
        },
        resolve: {
            extensions: [ ".ts", ".tsx", ".js", ".jsx", ".json" ]
        }
    }
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

                const reloadNodeApp = async () => {
                    try {
                        runtime.clearCache()
                        await runtime.executeUrl(entry)
                        console.log('✅ Ready\n')
                    } catch (error) {
                        console.error('❌ Execution failed:', error)
                        console.log('👀 Watching for changes...\n')
                    }
                }

                // Initial execution
                console.log(`🚀 Starting Node.js application...`)
                console.log(`📦 Entry: ${path.relative(process.cwd(), entry)}\n`)
                await reloadNodeApp()

                // Setup file watcher
                console.log('👀 Watching for file changes...\n')
                setupFileWatcher(server, reloadNodeApp)

                cleanup = async () => {
                    await runtime.destroy()
                    await server?.close()
                    process.exit(0)
                }
                break
            case "browser":
                console.log(`\n🌐 Starting browser dev server`)
                console.log(`📄 Entry: ${path.relative(process.cwd(), entry)}`)
                await server.listen()
                server.printUrls()
                console.log('\n✨ HMR enabled - file changes will auto-reload')
                console.log('👀 Watching for file changes...\n')
                break
        }
        process.on("SIGINT", cleanup)
        process.on("SIGTERM", cleanup)
        await new Promise(() => void 0)
    } catch (error) {
        if (server) {
            await server.close()
        }
        throw new BuildError("serve", "Failed to start development server. Check port availability and configuration.", error)
    }
}


export const vite = {
    build,
    serve
}
