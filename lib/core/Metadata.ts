import fs from "node:fs"
import path from "node:path"


export type Metadata = {
    outdir: string,
    output: string[]
}

export const Metadata = {
    async load(): Promise<Metadata> {
        const file = fs.readFileSync(path.join(process.cwd(), ".buildinfo"), "utf8")
        return JSON.parse(file)
    },
    async save(metadata: Metadata): Promise<void> {
        fs.writeFileSync(path.resolve(process.cwd(), ".buildinfo"), JSON.stringify(metadata, null, 2))
    }
}
