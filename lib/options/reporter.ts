import { defineOption } from "cmdore"
import configuration from "../core/configuration"


export default defineOption({
    name: "reporter",
    alias: "r",
    description: "Reporter to use",
    required: false,
    defaultValue: () => configuration()?.test?.reporter,
    parse: (value: string): string => {
        return value
    }
})
