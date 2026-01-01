import { defineOption } from "cmdore"
import configuration from "../core/configuration.js"


export default defineOption({
    name: "files",
    alias: "f",
    description: "Test file patterns (comma-separated)",
    required: false,
    defaultValue: () => configuration()?.test?.files,
    parse: (value?: string): string[] | undefined => {
        if (!value) {
            return undefined
        }
        // Split by comma and trim whitespace
        const patterns = value.split(",").map(f => f.trim()).filter(f => f.length > 0)
        return patterns.length > 0 ? patterns : undefined
    }
})
