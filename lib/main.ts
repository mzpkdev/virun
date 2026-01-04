import { Program, terminal } from "cmdore"
import { buildCommand } from "./commands/build.js"
import { serveCommand } from "./commands/serve.js"
import { testCommand } from "./commands/test.js"


export const main = async (...varargs: string[]): Promise<number> => {
    const program = new Program()
    program
        .register(buildCommand as any)
        .register(serveCommand as any)
        .register(testCommand as any)
    await program.execute(varargs)
    return 0
}

main(...process.argv.slice(2))
    .then(code => process.exit(code))
    .catch(error => {
        terminal.error(error)
        process.exit(1)
    })
