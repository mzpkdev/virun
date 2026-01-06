import * as path from "node:path"
import { builtinModules } from "module"
import { build as viteBuild, createServer, createViteRuntime, UserConfig, ViteDevServer, LibraryOptions } from "vite"
import type { Configuration, Target } from "./Configuration.js"


const build = async (_target: Target, configuration: Configuration): Promise<void> => {
    const { entry, module, outDir, preserveModules } = configuration

    const build = {
        outDir,
        emptyOutDir: true,
        target: "node18",
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
            build: {
                ...build,
                lib: {
                    entry,
                    formats: module
                }
            }
        })
        return
    }

    for (let i = 0; i < module.length; i++) {
        const item = module[i]
        const extension = item === "es"
            ? ".mjs"
            : ".js"
        await viteBuild({
            build: {
                ...build,
                emptyOutDir: i == 0,
                lib: {
                    entry,
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
        })
    }
}

const serve = async (target: Target, configuration: Configuration): Promise<void> => {
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
