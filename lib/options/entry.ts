import { defineOption } from "cmdore"


export const entryOption = defineOption({
    name: "entry",
    alias: "e",
    description: "Entry point file path",
    required: true,
    parse: (value: string): string => {
        return value
    }
})
