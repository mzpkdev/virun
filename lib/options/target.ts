import { defineOption } from "cmdore"
import type { Target } from "../core/Configuration"


export const targetOption = defineOption({
    name: "target",
    alias: "t",
    description: "Build target: node or browser",
    required: false,
    defaultValue: (): Target => "node",
    parse: (value: string): Target => {
        if (value !== "node" && value !== "browser") {
            throw new Error(`Invalid target. Must be "node" or "browser"`)
        }
        return value
    }
})
