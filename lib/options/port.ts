import { defineOption } from "cmdore"


export const portOption = defineOption({
    name: "port",
    alias: "p",
    description: "Dev server port",
    required: true,
    parse: (value: string): number => {
        const port = parseInt(value, 10)
        if (isNaN(port) || port < 1 || port > 65535) {
            throw new Error("Invalid port. Must be between 1 and 65535")
        }
        return port
    }
})
