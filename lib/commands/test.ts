import { defineCommand } from "cmdore"
import { startVitest } from "vitest/node"
import { findProjectRoot } from "../utils/project.js"
import { watchOption } from "../options/watch.js"
import { filesOption } from "../options/files.js"


export const testCommand = defineCommand({
    name: "test",
    description: "Run tests using Vitest",
    examples: [
        "",
        "--watch",
        "--coverage",
        "--ui",
        "--reporter verbose",
        "--files src/utils.test.ts"
    ],
    options: [ watchOption, filesOption ],
    run: async function* ({ files, watch }) {
        const root = await findProjectRoot()
        const filters: string[] = files || []
        const ctx = await startVitest("test", filters, {
            root,
            watch
        })
        if (!ctx) {
            return 1
        }
        await ctx.exit()
        return 0
    }
})
