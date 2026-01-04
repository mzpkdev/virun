import { defineOption } from "cmdore"


export const watchOption = defineOption({
    name: "watch",
    alias: "w",
    description: "Run tests in watch mode",
    required: false,
    defaultValue: () => false,
    parse: (): boolean => {
        return true
    }
})
