import { defineCommand } from "cmdore"
import * as ts from "typescript"
import * as path from "node:path"
import { findProjectRoot } from "../utils/project.js"


export const typecheckCommand = defineCommand({
    name: "typecheck",
    description: "Perform type checking without emitting files",
    examples: [
        "",
        "--watch"
    ],
    options: [
        {
            name: "watch",
            description: "Watch input files for changes",
            type: "boolean",
            alias: "w"
        }
    ],
    run: async function* (args) {
        const { watch } = args
        const root = await findProjectRoot()
        const configPath = path.join(root, "tsconfig.json")
        
        // Read and parse the TypeScript configuration
        const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
        if (configFile.error) {
            console.error(`Error reading config file: ${configFile.error.messageText}`)
            return 1
        }
        
        const parsedConfig = ts.parseJsonConfigFileContent(
            configFile.config,
            ts.sys,
            root
        )
        
        if (parsedConfig.errors.length > 0) {
            parsedConfig.errors.forEach(error => {
                console.error(`Config error: ${error.messageText}`)
            })
            return 1
        }
        
        // Set noEmit to true to only type check without emitting files
        const compilerOptions = {
            ...parsedConfig.options,
            noEmit: true
        }
        
        // Create the program
        let program: ts.Program
        if (watch) {
            // For watch mode, we'll create a watch program
            const host = ts.createWatchCompilerHost(
                parsedConfig.fileNames,
                compilerOptions,
                ts.sys,
                ts.createSemanticDiagnosticsBuilderProgram
            )
            
            const watchProgram = ts.createWatchProgram(host)
            program = watchProgram.getProgram().getProgram()
        } else {
            // For normal mode, create a standard program
            program = ts.createProgram({
                rootNames: parsedConfig.fileNames,
                options: compilerOptions
            })
        }
        
        // Get diagnostics (errors, warnings, etc.)
        const diagnostics = [
            ...program.getSyntacticDiagnostics(),
            ...program.getSemanticDiagnostics()
        ]
        
        // Report diagnostics
        if (diagnostics.length > 0) {
            diagnostics.forEach(diagnostic => {
                if (diagnostic.file) {
                    const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!)
                    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
                    console.error(`${diagnostic.file.fileName}(${line + 1},${character + 1}): error TS${diagnostic.code}: ${message}`)
                } else {
                    console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"))
                }
            })
            return 1
        }
        
        console.log("No type errors found!")
        return 0
    }
})
