import { defineOption } from "cmdore"


export const outdirOption = defineOption({
    name: "outdir",
    alias: "o",
    description: "Output directory for build artifacts",
    required: true,
    parse: (value: string): string => {
        return value
    }
})
