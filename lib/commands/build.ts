import { defineCommand } from "cmdore"
import { build } from "../core/vite.js"
import entry from "../options/entry.js"
import outdir from "../options/outdir.js"
import target from "../options/target.js"
import module from "../options/module.js"
import preserveModules from "../options/preserveModules.js"
import ConfigurationBuilder from "../core/ConfigurationBuilder.js"


export default defineCommand({
    name: "build",
    description: "Build project for production",
    examples: [
        "--target node",
        "--target browser",
        "--target node --entry src/main.ts",
        "--target node --preserve-modules"
    ],
    options: [ target, entry, outdir, module, preserveModules ],
    run: async function* (args: any) {
        const { target, entry, outdir, module, "preserve-modules": preserveModules } = args
        const builder = new ConfigurationBuilder("build") as any
        builder.entry(entry)
        builder.outdir(outdir)
        builder.module(module)
        builder.preserveModules(preserveModules)
        const configuration = await builder.build()
        await build(target, configuration)
        return 0
    }
})
