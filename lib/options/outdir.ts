import { defineOption } from "cmdore"
import configuration from "../core/configuration"


export default defineOption({
    name: "outdir",
    alias: "o",
    description: "Output directory",
    required: false,
    defaultValue: () => configuration()?.outdir ?? "dist",
    parse: (value: string): string => {
        return value
    }
})
