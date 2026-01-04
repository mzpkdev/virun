import { defineOption } from "cmdore"


export const uiOption = defineOption({
    name: "ui",
    description: "Start Vitest UI",
    required: false,
    defaultValue: () => false,
    parse: (): boolean => {
        return true
    }
})
