import { defineOption } from "cmdore"
import configuration from "../core/configuration.js"


export default defineOption({
    name: "entry",
    alias: "e",
    description: "Entry point file path",
    required: false,
    defaultValue: () => configuration()?.entry ?? "src/main.ts",
    parse: (value: string): string => {
        return value
    }
})
