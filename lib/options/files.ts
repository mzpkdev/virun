import { defineOption } from "cmdore"


export const filesOption = defineOption({
    name: "files",
    alias: "f",
    description: "Test file patterns (comma-separated)",
    required: false,
    parse: (...values: string[]): string[] => {
        return values
    }
})
