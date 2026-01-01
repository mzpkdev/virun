import { Program, terminal } from "cmdore"
import buildCommand from "./commands/build"
import serveCommand from "./commands/serve"
import testCommand from "./commands/test"
import cleanCommand from "./commands/clean"


export const main = async (...varargs: string[]): Promise<number> => {
    const program = new Program()
    program
        .register(buildCommand as any)
        .register(serveCommand as any)
        .register(testCommand as any)
        .register(cleanCommand as any)
    await program.execute(varargs)
    return 0
}

main(...process.argv.slice(2))
    .then(code => process.exit(code))
    .catch(error => {
        terminal.error(error)
        process.exit(1)
    })

