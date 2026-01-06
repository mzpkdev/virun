import fs from "node:fs"
import path from "node:path"
import { MetadataError } from "../errors.js"


export type Metadata = {
    outdir: string,
    output: string[]
}

export const Metadata = {
    async load(): Promise<Metadata> {
        const metadataPath = path.join(process.cwd(), ".buildinfo")

        let file: string
        try {
            file = fs.readFileSync(metadataPath, "utf8")
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") {
                throw new MetadataError("No .buildinfo file found. Run 'virun build' first.", error)
            }
            throw new MetadataError("Failed to read .buildinfo file", error)
        }

        try {
            return JSON.parse(file)
        } catch (error) {
            throw new MetadataError(".buildinfo file contains invalid JSON. Try rebuilding the project.", error)
        }
    },
    async save(metadata: Metadata): Promise<void> {
        const metadataPath = path.resolve(process.cwd(), ".buildinfo")
        try {
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
        } catch (error) {
            throw new MetadataError("Failed to save .buildinfo file", error)
        }
    }
}
