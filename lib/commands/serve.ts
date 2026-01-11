import { defineCommand } from "cmdore"
import { ServeConfiguration, vite } from "../core/vite.js"
import { adapterOption } from "../options/adapter.js"
import { entryOption } from "../options/entry.js"
import { portOption } from "../options/port.js"
import { targetOption } from "../options/target.js"
import { Configuration } from "../core/Configuration.js"


export const serveCommand = defineCommand({
    name: "serve",
    description: "Start development server with HMR",
    examples: [
        "--target node",
        "--target browser",
        "--target node --entry src/main.ts",
        "--target node --adapter express",
        "--target browser --port 3000"
    ],
    options: [ targetOption, entryOption, portOption, adapterOption ],
    run: async function* ({ target, entry, port, adapter }) {
        const configuration = await new Configuration.Builder("serve")
            .entry(entry)
            .port(port)
            .adapter(adapter)
            .build()
        await vite.serve(target, configuration as ServeConfiguration)
        return 0
    }
})
