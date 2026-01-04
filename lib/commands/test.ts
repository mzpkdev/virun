import { defineCommand } from "cmdore"
import { startVitest } from "vitest/node"
import { findProjectRoot } from "../utils/project.js"
import { watchOption } from "../options/watch.js"
import { coverageOption } from "../options/coverage.js"
import { uiOption } from "../options/ui.js"
import { reporterOption } from "../options/reporter.js"
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
    options: [ watchOption, coverageOption, uiOption, reporterOption, filesOption ],
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
