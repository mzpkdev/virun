export function handleApiRequest(req: any, res: any) {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
        path: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    }))
}

export function handleHealthCheck(req: any, res: any) {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ status: "ok" }))
}
