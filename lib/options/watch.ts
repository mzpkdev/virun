import { defineOption } from "cmdore"
import configuration from "../core/configuration.js"


export default defineOption({
    name: "watch",
    alias: "w",
    description: "Run tests in watch mode",
    required: false,
    defaultValue: () => configuration()?.test?.watch ?? false,
    parse: (value?: string): boolean => {
        // Boolean flag: if present (even with empty value), return true
        if (value === undefined || value === "" || value === "true") {
            return true
        }
        if (value === "false") {
            return false
        }
        throw new Error(`Invalid watch value. Must be "true" or "false"`)
    }
})
