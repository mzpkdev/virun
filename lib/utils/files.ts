import * as fs from "node:fs/promises"
import * as path from "node:path"
import { FileSystemError } from "../errors.js"

/**
 * Recursively find all TypeScript files in a directory
 * @param directory - Absolute path to directory to search
 * @returns Array of absolute file paths to .ts and .tsx files (excluding tests)
 */
export async function findTypeScriptFiles(directory: string): Promise<string[]> {
    const files: string[] = []

    async function walk(dir: string): Promise<void> {
        let entries
        try {
            entries = await fs.readdir(dir, { withFileTypes: true })
        } catch (error) {
            throw new FileSystemError("Failed to read directory", dir, error)
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)

            if (entry.isDirectory()) {
                // Skip node_modules and dist
                if (entry.name === "node_modules" || entry.name === "dist") {
                    continue
                }
                await walk(fullPath)
            } else if (entry.isFile()) {
                // Include .ts and .tsx files, exclude test files
                if (
                    (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
                    !entry.name.endsWith(".test.ts") &&
                    !entry.name.endsWith(".test.tsx") &&
                    !entry.name.endsWith(".spec.ts") &&
                    !entry.name.endsWith(".spec.tsx")
                ) {
                    files.push(fullPath)
                }
            }
        }
    }

    await walk(directory)
    return files.sort()
}

/**
 * Get the directory to search for TypeScript files
 * If entry is a file, return its parent directory
 * If entry is a directory, return it
 * @param entry - Absolute path to file or directory
 * @returns Absolute path to directory
 */
export async function resolveSourceDirectory(entry: string): Promise<string> {
    let stats
    try {
        stats = await fs.stat(entry)
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            throw new FileSystemError("Entry path does not exist", entry, error)
        }
        throw new FileSystemError("Failed to access entry path", entry, error)
    }
    if (stats.isFile()) {
        return path.dirname(entry)
    }
    return entry
}
