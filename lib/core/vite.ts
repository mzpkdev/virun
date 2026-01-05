import * as path from "node:path"
import { build as viteBuild, createServer, createViteRuntime, UserConfig, ViteDevServer } from "vite"
import type { Configuration, Target } from "./Configuration.js"


const createViteNodeConfiguration = async (configuration: Configuration): Promise<UserConfig> => {
    const { outDir, module } = configuration
    return {
        build: {
            outDir,
            emptyOutDir: true,
            lib: {
                entry: path.resolve(process.cwd(), "src/index.ts"),
                formats: module,
                fileName: "index"
            },
            rollupOptions: {
                external: [
                    /^node:.*/
                ]
            }
        }
    }
}

const createViteBrowserConfiguration = async (configuration: Configuration): Promise<UserConfig> => {
    const { outDir } = configuration
    return {
        build: {
            outDir,
            emptyOutDir: true
        }
    }
}


const build = async (target: Target, configuration: Configuration): Promise<void> => {
    const viteConfiguration = target == "node"
        ? await createViteNodeConfiguration(configuration)
        : await createViteBrowserConfiguration(configuration)
    await viteBuild(viteConfiguration)
}

const serve = async (target: Target, configuration: Configuration): Promise<void> => {
    const viteConfiguration = target == "node"
        ? await createViteNodeConfiguration(configuration)
        : await createViteBrowserConfiguration(configuration)
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
