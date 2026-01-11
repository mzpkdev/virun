/// <reference types="vite/client" />
import { createServer, IncomingMessage, ServerResponse } from "node:http"
import { getConfig } from "./config"
import { formatDate, getGreeting } from "./utils"
import { log, logError } from "./logger"
import { createCorsHandler } from "./middleware/cors"
import { handleApiRequest, handleHealthCheck } from "./routes/api"
import _ from "lodash"

const { port: PORT, host: HOST } = getConfig()

console.log(_.add(7, 7))

const cors = createCorsHandler({ origin: "*", methods: ["GET", "POST"] })

export const viteNodeApp = (req: IncomingMessage, res: ServerResponse) => {
    cors(req, res, () => {
        if (req.url === "/health") {
            handleHealthCheck(req, res)
        } else if (req.url?.startsWith("/api")) {
            handleApiRequest(req, res)
        } else {
            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(JSON.stringify({
                message: `${getGreeting()} from HTTP app!`,
                timestamp: formatDate(new Date()),
                url: req.url,
                method: req.method
            }))
        }
    })
}

if (import.meta.env.PROD) {
    const server = createServer(viteNodeApp)
    server.listen(PORT, HOST, () => {
        log(`🚀 Server running at http://${HOST}:${PORT}`)
        log(`📅 Started at ${formatDate(new Date())}`)
    })
}
