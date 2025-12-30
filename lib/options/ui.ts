import { defineOption } from "cmdore"
import configuration from "../core/configuration.js"


export default defineOption({
    name: "ui",
    description: "Start Vitest UI",
    required: false,
    defaultValue: () => configuration?.test?.ui ?? false,
    parse: (value?: string): boolean => {
        // Boolean flag: if present (even with empty value), return true
        if (value === undefined || value === "" || value === "true") {
            return true
        }
        if (value === "false") {
            return false
        }
        throw new Error(`Invalid ui value. Must be "true" or "false"`)
    }
})
