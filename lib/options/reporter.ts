import { defineOption } from "cmdore"


export const reporterOption = defineOption({
    name: "reporter",
    alias: "r",
    description: "Reporter to use",
    required: false,
    parse: (value: string): string => {
        return value
    }
})
