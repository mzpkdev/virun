export function requireAuth(req: any, res: any, next: () => void) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        res.writeHead(401, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Unauthorized" }))
        return
    }
    next()
}

export function optionalAuth(req: any, res: any, next: () => void) {
    // Just pass through, auth is optional
    next()
}
