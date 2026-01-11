import { defineOption } from "cmdore"
import type { Adapter } from "../core/Configuration"


const VALID_ADAPTERS: Adapter[] = ["http", "express", "fastify", "koa", "nest"]

export const adapterOption = defineOption({
    name: "adapter",
    alias: "a",
    description: "Server adapter: http, express, fastify, koa, nest",
    required: false,
    defaultValue: (): Adapter => "http",
    parse: (value: string): Adapter => {
        if (!VALID_ADAPTERS.includes(value as Adapter)) {
            throw new Error(`Invalid adapter. Must be one of: ${VALID_ADAPTERS.join(", ")}`)
        }
        return value as Adapter
    }
})
