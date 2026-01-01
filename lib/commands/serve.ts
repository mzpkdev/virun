import { defineCommand } from "cmdore"
import { serve } from "../core/vite.ts"
import entry from "../options/entry.ts"
import port from "../options/port.ts"
import target from "../options/target.ts"
import ConfigurationBuilder from "../core/ConfigurationBuilder.ts"


export default defineCommand({
    name: "serve",
    description: "Start development server with HMR",
    examples: [
        "--target node",
        "--target browser",
        "--target node --entry src/main.ts",
        "--target browser --port 3000"
    ],
    options: [ target, entry, port ],
    run: async function* ({ target, entry, port }) {
        const configuration = await new ConfigurationBuilder("serve")
            .entry(entry)
            .port(port)
            .build()
        await serve(target, configuration)
        return 0
    }
})
