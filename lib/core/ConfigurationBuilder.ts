import * as path from "node:path"
import { findProjectRoot } from "../utils/project.js"
import type { Mode, Configuration, Module } from "./configuration.js"


class ConfigurationBuilder {
    private readonly _mode: Mode
    private _entry?: string
    private _outdir?: string
    private _port?: number
    private _module?: Module[]
    private _preserveModules?: boolean

    constructor(mode: Mode) {
        this._mode = mode
    }

    entry(value: string): this {
        this._entry = value
        return this
    }

    outdir(value: string): this {
        this._outdir = value
        return this
    }

    port(value: number): this {
        this._port = value
        return this
    }

    module(value: Module[]): this {
        this._module = value
        return this
    }

    preserveModules(value: boolean): this {
        this._preserveModules = value
        return this
    }

    async build(): Promise<Configuration> {
        const root = await findProjectRoot()
        return {
            root,
            mode: this._mode,
            entry: path.resolve(root, this._entry!),
            outdir: this._outdir,
            port: this._port,
            module: this._module,
            preserveModules: this._preserveModules
        }
    }
}


export default ConfigurationBuilder
export type { Mode, Target, Module, Configuration } from "./configuration.js"