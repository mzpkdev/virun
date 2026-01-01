import { defineOption } from "cmdore"
import configuration from "../core/configuration"


export default defineOption({
    name: "coverage",
    alias: "c",
    description: "Collect coverage information",
    required: false,
    defaultValue: () => configuration()?.test?.coverage ?? false,
    parse: (value?: string): boolean => {
        // Boolean flag: if present (even with empty value), return true
        if (value === undefined || value === "" || value === "true") {
            return true
        }
        if (value === "false") {
            return false
        }
        throw new Error(`Invalid coverage value. Must be "true" or "false"`)
    }
})
