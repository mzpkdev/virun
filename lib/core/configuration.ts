import * as fs from "node:fs/promises"
import { readFileSync, accessSync } from "node:fs"
import { createRequire } from "node:module"
import { pathToFileURL } from "node:url"
import path from "node:path"
import { findProjectRoot } from "../utils/project"


export type Mode = "build" | "serve"
export type Target = "node" | "browser"
export type Module = "esm" | "cjs"

export type Configuration = {
    root?: string
    mode?: Mode
    entry?: string
    module?: Module[]
    outdir?: string
    port?: number
    preserveModules?: boolean
    test?: {
        watch?: boolean
        coverage?: boolean
        ui?: boolean
        reporter?: string
        files?: string[]
    }
}

export async function loadConfigFile(): Promise<Configuration | null> {
    const root = await findProjectRoot()
    const configPath = path.join(root, "virun.config.js")

    try {
        await fs.access(configPath)
    } catch {
        return null
    }

    try {
        // Try ESM import first
        try {
            const configUrl = pathToFileURL(configPath).href
            const config = await import(configUrl)
            return (config.default || config) as Configuration
        } catch {
            // Fall back to CommonJS - read and evaluate manually
            const configContent = readFileSync(configPath, "utf-8")
            const moduleExports: any = {}
            const moduleObj = { exports: moduleExports }
            const configDir = path.dirname(configPath)
            const requireFn = createRequire(path.join(configDir, "package.json") + "/")
            const fn = new Function("module", "exports", "require", configContent + "\nreturn module.exports")
            const config = fn(moduleObj, moduleExports, requireFn) || moduleExports
            return config as Configuration
        }
    } catch (error: any) {
        throw new Error(`Failed to load virun.config.js: ${error.message}`)
    }
}


/**
 * Configuration loaded from virun.config.js file.
 * Loaded synchronously using readFileSync for immediate access.
 * All options share this cached instance.
 */
let cachedConfiguration: Configuration | null | undefined = undefined

function findProjectRootSync(startDir: string = process.cwd()): string {
    let current = startDir
    while (true) {
        const pkgPath = path.join(current, "package.json")
        try {
            accessSync(pkgPath)
            return current
        } catch {
            const parent = path.dirname(current)
            if (parent === current) {
                throw new Error("Could not find package.json. Make sure you're in a Node.js project directory.")
            }
            current = parent
        }
    }
}

function getConfigurationSync(): Configuration | null {
    if (cachedConfiguration === undefined) {
        // Load synchronously for use in synchronous defaultValue functions
        try {
            const root = findProjectRootSync()
            const configPath = path.join(root, "virun.config.js")

            try {
                // Check if file exists
                accessSync(configPath)
                // Try to read the file synchronously
                const configContent = readFileSync(configPath, "utf-8")
                const moduleExports: any = {}
                const moduleObj = { exports: moduleExports }
                const configDir = path.dirname(configPath)
                const requireFn = createRequire(path.join(configDir, "package.json") + "/")
                const fn = new Function("module", "exports", "require", configContent + "\nreturn module.exports")
                const config = fn(moduleObj, moduleExports, requireFn) || moduleExports
                cachedConfiguration = config as Configuration
            } catch {
                // File doesn't exist or can't be read
                cachedConfiguration = null
            }
        } catch {
            // Can't find project root
            cachedConfiguration = null
        }
    }
    return cachedConfiguration
}

// Export synchronous getter for use in defaultValue functions
export default getConfigurationSync
