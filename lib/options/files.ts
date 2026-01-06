import { defineOption } from "cmdore"
import { ValidationError } from "../errors.js"


export const filesOption = defineOption({
    name: "files",
    alias: "f",
    description: "Test file patterns (comma-separated)",
    required: false,
    parse: (...values: string[]): string[] => {
        const result: string[] = []
        for (const value of values) {
            const trimmed = value.trim()
            if (trimmed === "") {
                continue
            }
            if (trimmed.includes("\0")) {
                throw new ValidationError("files", value, "File pattern contains invalid characters")
            }
            result.push(trimmed)
        }
        return result
    }
})
