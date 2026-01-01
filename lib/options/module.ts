import { defineOption } from "cmdore"
import configuration from "../core/configuration.js"
import type { Module } from "../core/configuration.js"

export default defineOption({
    name: "module",
    alias: "m",
    description: "Output module format(s): esm, cjs, or both (comma-separated)",
    required: false,
    defaultValue: (): Module[] => configuration()?.module ?? ["esm"],
    parse: (...values: string[]): Module[] => {
        return values as Module[]
    }
})
