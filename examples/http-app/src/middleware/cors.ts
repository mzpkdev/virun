export interface CorsOptions {
    origin?: string | string[]
    methods?: string[]
}

export function createCorsHandler(options: CorsOptions = {}) {
    return (req: any, res: any, next: () => void) => {
        const origin = options.origin || "*"
        res.setHeader("Access-Control-Allow-Origin", origin)
        res.setHeader("Access-Control-Allow-Methods", options.methods?.join(", ") || "GET, POST, PUT, DELETE")
        next()
    }
}
