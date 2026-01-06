import { defineOption } from "cmdore"
import { Module } from "../core/Configuration"
import { ValidationError } from "../errors.js"


const VALID_MODULES: Module[] = ["es", "cjs"]

export const moduleOption = defineOption({
    name: "module",
    alias: "m",
    description: "Output module format(s): es, cjs, or both (comma-separated)",
    required: false,
    defaultValue: (): Module[] => [ "es" ],
    parse: (...values: string[]): Module[] => {
        if (values.length === 0) {
            return ["es"]
        }
        const modules: Module[] = []
        for (const value of values) {
            const normalized = value.toLowerCase().trim()
            if (!VALID_MODULES.includes(normalized as Module)) {
                throw new ValidationError("module", value, `Must be "es" or "cjs". Got "${value}"`)
            }
            modules.push(normalized as Module)
        }
        return [...new Set(modules)]
    }
})
