import * as path from "node:path"
import { build as viteBuild, createServer, createViteRuntime, UserConfig, ViteDevServer } from "vite"
import type { Configuration, Target } from "./Configuration"


const createViteNodeConfiguration = async (configuration: Configuration): Promise<UserConfig> => {
    const { outdir: outDir } = configuration
    return {
        build: {
            outDir,
            emptyOutDir: true,
            lib: {
                entry: path.resolve(process.cwd(), "src/index.ts"),
                formats: [ "es" ],
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


const build = async (_target: Target, configuration: Configuration): Promise<void> => {
    const viteConfiguration = await createViteNodeConfiguration(configuration)
    await viteBuild(viteConfiguration)
}

const serve = async (target: Target, configuration: Configuration): Promise<void> => {
    const viteConfiguration = await createViteNodeConfiguration(configuration)
    let server: ViteDevServer | null = null
    try {
        server = await createServer(viteConfiguration)
        let cleanup = async () => {
            await server?.close()
            process.exit(0)
        }
        switch (target) {
            case "node":
                console.log("wat")
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
        await new Promise(() => {
        })
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