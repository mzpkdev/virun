import { builtinModules } from "module"
import { build as viteBuild, createServer, createViteRuntime, UserConfig, ViteDevServer } from "vite"
import dts from "vite-plugin-dts"
import path from "node:path"
import { RollupOutput } from "rollup"
import { Configuration, Module, Target } from "./Configuration.js"
import { Metadata } from "./Metadata.js"


export type BuildConfiguration = {
    entry: string
    module: Module[]
    outdir: string
    preserveModules: boolean
}

const build = async (_target: Target, configuration: BuildConfiguration): Promise<void> => {
    const { entry, module, outdir, preserveModules } = configuration

    const build = {
        outDir: outdir,
        emptyOutDir: true,
        target: "node18",
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

    if (!preserveModules) {
        await viteBuild({
            plugins: [ dts({
                rollupTypes: true,
                tsconfigPath: path.resolve(process.cwd(), "tsconfig.json")
            }) ],
            build: {
                ...build,
                lib: {
                    entry: entry,
                    formats: module,
                    fileName: "index"
                }
            }
        })
        return
    }
    const output = new Set<string>()
    for (let i = 0; i < module.length; i++) {
        const item = module[i]
        const extension = item === "es"
            ? ".mjs"
            : ".js"
        const [ { output: chunks } ] = await viteBuild({
            plugins: [ dts({
                rollupTypes: false,
                tsconfigPath: path.resolve(process.cwd(), "tsconfig.json"),
                afterBuild: (emitted) => {
                    for (const filename of emitted.keys()) {
                        output.add(filename)
                    }
                }
            }) ],
            build: {
                ...build,
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
                                throw new Error("// TODO")
                            }
                            return `[name]${extension}`
                        }
                    }
                }
            }
        }) as RollupOutput[]
        for (const chunk of chunks) {
            output.add(path.join(outdir, chunk.fileName))
        }
    }
    await Metadata.save({
        outdir: outdir,
        output: Array.from(output)
    })
}

export type ServeConfiguration = {
    entry: string
}

const serve = async (target: Target, configuration: ServeConfiguration): Promise<void> => {
    const viteConfiguration: UserConfig = {}
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
        await new Promise(() => void 0)
    } catch (error) {
        if (server) {
            await server.close()
        }
        throw error
    }
}


export const vite = {
    build,
    serve
}
