import { defineOption } from "cmdore"
import { ValidationError } from "../errors.js"


export const outdirOption = defineOption({
    name: "outdir",
    alias: "o",
    description: "Output directory for build artifacts",
    required: true,
    parse: (value: string): string => {
        if (!value || value.trim() === "") {
            throw new ValidationError("outdir", value, "Output directory cannot be empty")
        }
        if (value.includes("\0")) {
            throw new ValidationError("outdir", value, "Output directory contains invalid characters")
        }
        return value.trim()
    }
})
