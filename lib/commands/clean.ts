import { defineCommand } from "cmdore"
import fs from "node:fs"
import path from "node:path"
import { Metadata } from "../core/Metadata.js"


export const cleanCommand = defineCommand({
    name: "clean",
    description: "Remove build artifacts and output directories",
    examples: [
        ""
    ],
    options: [],
    run: async function* () {
        const metadata = await Metadata.load()
        for (const artifact of metadata.output) {
            fs.unlinkSync(path.resolve(process.cwd(), artifact))
        }
        fs.rmSync(metadata.outdir, { recursive: true })
        return 0
    }
})
