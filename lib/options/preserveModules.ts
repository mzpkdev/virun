import { defineOption } from "cmdore"
import configuration from "../core/configuration.ts"

export default defineOption({
    name: "preserve-modules",
    alias: "p",
    description: "Build each file separately (library mode, like tsc)",
    required: false,
    defaultValue: () => configuration()?.preserveModules ?? false,
    parse: (value?: string): boolean => {
        // Handle --preserve-modules (no value) and --preserve-modules=true/false
        if (value === undefined) return true
        return value !== "false" && value !== "0"
    }
})
