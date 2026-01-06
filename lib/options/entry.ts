import { defineOption } from "cmdore"


export const entryOption = defineOption({
    name: "entry",
    alias: "e",
    description: "Entry point file path (Node.js target only)",
    required: true,
    parse: (value: string): string => {
        return value
    }
})
