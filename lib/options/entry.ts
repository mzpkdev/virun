import { defineOption } from "cmdore"
import configuration from "../core/configuration"


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
