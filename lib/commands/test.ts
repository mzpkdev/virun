import { defineCommand } from "cmdore"
import { findProjectRoot } from "../utils/project.ts"
import { startVitest } from "vitest/node"
import watch from "../options/watch.ts"
import coverage from "../options/coverage.ts"
import ui from "../options/ui.ts"
import reporter from "../options/reporter.ts"
import files from "../options/files.ts"


export default defineCommand({
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
    options: [ watch, coverage, ui, reporter, files ],
    run: async function* ({ watch, coverage, ui, reporter, files }) {
        const root = await findProjectRoot()
        const vitestOptions: any = { root }

        if (watch) {
            vitestOptions.watch = true
        } else {
            // Set default: run once unless watch is explicitly requested
            vitestOptions.run = true
        }

        if (coverage) {
            vitestOptions.coverage = true
        }
        if (ui) {
            vitestOptions.ui = true
        }
        if (reporter) {
            vitestOptions.reporter = reporter
        }

        const filters: string[] = files || []
        const ctx = await startVitest(
            "test",
            filters,
            vitestOptions
        )
        if (!ctx) {
            return 1
        }
        await ctx.exit()
        return 0
    }
})
