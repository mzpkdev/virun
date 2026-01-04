import { defineOption } from "cmdore"


export const coverageOption = defineOption({
    name: "coverage",
    alias: "c",
    description: "Collect coverage information",
    required: false,
    defaultValue: () => false,
    parse: (): boolean => {
        return true
    }
})
