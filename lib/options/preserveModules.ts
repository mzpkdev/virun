import { defineOption } from "cmdore"

export const preserveModulesOption = defineOption({
    name: "preserve-modules",
    description: "Preserve module structure instead of bundling",
    required: false,
    defaultValue: (): boolean => false,
    parse: (): boolean => {
        return true
    }
})
