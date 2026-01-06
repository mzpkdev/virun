export class VirunError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message)
        this.name = "VirunError"
    }
}

export class FileSystemError extends VirunError {
    constructor(message: string, public readonly path: string, cause?: unknown) {
        super(`${message}: ${path}`, cause)
        this.name = "FileSystemError"
    }
}

export class ValidationError extends VirunError {
    constructor(public readonly option: string, public readonly value: unknown, message: string) {
        super(`Invalid ${option}: ${message}`)
        this.name = "ValidationError"
    }
}

export class BuildError extends VirunError {
    constructor(public readonly operation: "build" | "serve", message: string, cause?: unknown) {
        super(`${operation} failed: ${message}`, cause)
        this.name = "BuildError"
    }
}

export class MetadataError extends VirunError {
    constructor(message: string, cause?: unknown) {
        super(`Metadata error: ${message}`, cause)
        this.name = "MetadataError"
    }
}
