import { defineCommand } from "cmdore"
import outdir from "../options/outdir"
import { findTypeScriptFiles } from "../utils/files"
import { findProjectRoot } from "../utils/project"
import * as fs from "node:fs/promises"
import * as path from "node:path"


async function removeFile(filePath: string): Promise<void> {
    try {
        await fs.unlink(filePath)
        console.log(`Removed: ${filePath}`)
    } catch (error: any) {
        // Ignore ENOENT (file doesn't exist), that's fine
        if (error.code !== 'ENOENT') {
            console.warn(`Failed to remove ${filePath}: ${error.message}`)
        }
    }
}


async function cleanDirectory(dir: string): Promise<void> {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                if (entry.name === '_virtual') {
                    // Remove _virtual directory recursively
                    try {
                        await fs.rm(fullPath, { recursive: true, force: true })
                        console.log(`Removed directory: ${fullPath}`)
                    } catch (error: any) {
                        // Ignore ENOENT (directory doesn't exist), that's fine
                        if (error.code !== 'ENOENT') {
                            console.warn(`Failed to remove ${fullPath}: ${error.message}`)
                        }
                    }
                } else if (entry.name !== 'node_modules') {
                    await cleanDirectory(fullPath)
                }
            } else if (entry.isFile()) {
                // Remove files ending with .js, .mjs, .d.ts, or .map
                if (entry.name.match(/\.(js|mjs|d\.ts|js\.map|mjs\.map|d\.ts\.map)$/)) {
                    await removeFile(fullPath)
                }
            }
        }
    } catch (error: any) {
        if (error.code !== 'ENOENT') {
            throw error
        }
    }
}


async function removeVirtualDirectories(dir: string): Promise<void> {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                if (entry.name === '_virtual') {
                    // Remove _virtual directory recursively
                    try {
                        await fs.rm(fullPath, { recursive: true, force: true })
                        console.log(`Removed directory: ${fullPath}`)
                    } catch (error: any) {
                        // Ignore ENOENT (directory doesn't exist), that's fine
                        if (error.code !== 'ENOENT') {
                            console.warn(`Failed to remove ${fullPath}: ${error.message}`)
                        }
                    }
                } else if (entry.name !== 'node_modules') {
                    // Recursively search in subdirectories
                    await removeVirtualDirectories(fullPath)
                }
            }
        }
    } catch (error: any) {
        // Ignore ENOENT (directory doesn't exist), that's fine
        if (error.code !== 'ENOENT') {
            throw error
        }
    }
}


async function clean(outdirPath: string): Promise<void> {
    if (!outdirPath) {
        throw new Error("Missing required configuration: outdir")
    }

    const root = await findProjectRoot()
    const resolvedOutdir = path.resolve(root, outdirPath)

    // Check if outdir contains TypeScript source files (preserve-modules mode)
    // Note: findTypeScriptFiles may return .d.ts files, so filter them out
    let tsFiles: string[] = []
    try {
        const allFiles = await findTypeScriptFiles(resolvedOutdir)
        // Filter out .d.ts files - we only want actual source .ts/.tsx files
        tsFiles = allFiles.filter(file => !file.endsWith('.d.ts'))
    } catch (error: any) {
        // If directory doesn't exist or can't be read, treat as regular bundling mode
        if (error.code !== 'ENOENT') {
            throw error
        }
    }

    if (tsFiles.length > 0) {
        // Strategy A: Match artifacts to source files in outdir
        for (const tsFile of tsFiles) {
            const basePath = tsFile.replace(/\.tsx?$/, "")
            const artifacts = [
                `${basePath}.js`,
                `${basePath}.mjs`,
                `${basePath}.d.ts`,
                `${basePath}.js.map`,
                `${basePath}.mjs.map`,
                `${basePath}.d.ts.map`
            ]
            for (const artifact of artifacts) {
                await removeFile(artifact)
            }
        }
        // Remove _virtual directories
        await removeVirtualDirectories(resolvedOutdir)
    } else {
        // Strategy B: Clean entire output directory (regular bundling mode)
        // cleanDirectory already handles _virtual directories
        await cleanDirectory(resolvedOutdir)
        // Remove the directory itself after cleaning (only for separate output dirs like dist)
        try {
            // Check if directory is empty before removing
            const entries = await fs.readdir(resolvedOutdir)
            if (entries.length === 0) {
                await fs.rmdir(resolvedOutdir)
                console.log(`Removed directory: ${resolvedOutdir}`)
            }
        } catch (error: any) {
            // Ignore if directory doesn't exist or is not empty
            if (error.code !== 'ENOENT' && error.code !== 'ENOTEMPTY') {
                throw error
            }
        }
    }
}


export default defineCommand({
    name: "clean",
    description: "Remove build artifacts (like tsc --build --clean)",
    examples: [
        "",
        "--outdir src",
        "--outdir dist"
    ],
    options: [outdir],
    run: async function* (args: any) {
        const { outdir: outdirValue } = args
        await clean(outdirValue)
        return 0
    }
})
