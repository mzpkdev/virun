export interface ServerConfig {
    port: number
    host: string
}

export function getConfig(): ServerConfig {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
    const host = process.env.HOST || "localhost"
    return { port, host }
}
