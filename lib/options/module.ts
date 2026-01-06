import { defineOption } from "cmdore"
import { Module } from "../core/Configuration"


export const moduleOption = defineOption({
    name: "module",
    alias: "m",
    description: "Output module format(s): es, cjs, or both (comma-separated)",
    required: false,
    defaultValue: (): Module[] => [ "es" ],
    parse: (...values: string[]): Module[] => {
        return values as Module[]
    }
})
