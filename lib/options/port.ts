import { defineOption } from "cmdore"
import configuration from "../core/configuration"


export default defineOption({
    name: "port",
    alias: "p",
    description: "Dev server port",
    required: false,
    defaultValue: () => configuration()?.port ?? 5173,
    parse: (value: string): number => {
        const port = parseInt(value, 10)
        if (isNaN(port) || port < 1 || port > 65535) {
            throw new Error("Invalid port. Must be between 1 and 65535")
        }
        return port
    }
})
