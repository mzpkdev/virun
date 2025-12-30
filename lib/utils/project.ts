import * as fs from "node:fs/promises"
import * as path from "node:path"


/**
 * Find project root (directory containing package.json)
 */
export async function findProjectRoot(startDir: string = process.cwd()): Promise<string> {
    let current = startDir

    while (true) {
        const pkgPath = path.join(current, "package.json")
        try {
            await fs.access(pkgPath)
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
