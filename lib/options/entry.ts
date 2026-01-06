import { defineOption } from "cmdore"
import { ValidationError } from "../errors.js"


export const entryOption = defineOption({
    name: "entry",
    alias: "e",
    description: "Entry point file path (Node.js target only)",
    required: true,
    parse: (value: string): string => {
        if (!value || value.trim() === "") {
            throw new ValidationError("entry", value, "Entry path cannot be empty")
        }
        if (value.includes("\0")) {
            throw new ValidationError("entry", value, "Entry path contains invalid characters")
        }
        return value.trim()
    }
})
