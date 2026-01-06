import { defineCommand } from "cmdore"
import { vite } from "../core/vite.js"
import { entryOption } from "../options/entry.js"
import { outdirOption } from "../options/outdir.js"
import { targetOption } from "../options/target.js"
import { moduleOption } from "../options/module.js"
import { preserveModulesOption } from "../options/preserveModules.js"
import { Configuration } from "../core/Configuration.js"


export const buildCommand = defineCommand({
    name: "build",
    description: "Build project for production",
    examples: [
        "--target node",
        "--target browser",
        "--target node --entry src/main.ts",
        "--target node --preserve-modules"
    ],
    options: [ targetOption, entryOption, outdirOption, moduleOption, preserveModulesOption ],
    run: async function* (args) {
        const { target, entry, outdir, module, "preserve-modules": preserveModules } = args
        const configuration = await new Configuration.Builder("build")
            .entry(entry)
            .outDir(outdir)
            .module(module)
            .preserveModules(preserveModules)
            .build()
        await vite.build(target, configuration)
        return 0
    }
})
