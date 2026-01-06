import { defineCommand } from "cmdore"
import fs from "node:fs"
import path from "node:path"
import { Metadata } from "../core/Metadata.js"
import { FileSystemError } from "../errors.js"


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
            const artifactPath = path.resolve(process.cwd(), artifact)
            try {
                fs.unlinkSync(artifactPath)
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                    throw new FileSystemError("Failed to remove artifact", artifactPath, error)
                }
            }
        }
        try {
            fs.rmSync(metadata.outdir, { recursive: true, force: true })
        } catch (error) {
            throw new FileSystemError("Failed to remove output directory", metadata.outdir, error)
        }
        return 0
    }
})
