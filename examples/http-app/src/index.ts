import { createServer } from "node:http"
import { getConfig } from "./config"
import { formatDate, getGreeting } from "./utils"
import { log, logError } from "./logger"
import { createCorsHandler } from "./middleware/cors"
import { handleApiRequest, handleHealthCheck } from "./routes/api"
import _ from "lodash"

const { port: PORT, host: HOST } = getConfig()

console.log(_.add(1, 1))

const cors = createCorsHandler({ origin: "*", methods: ["GET", "POST"] })

const server = createServer((req, res) => {
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
})

server.listen(PORT, HOST, () => {
    log(`🚀 Server running at http://${HOST}:${PORT}`)
    log(`📅 Started at ${formatDate(new Date())}`)
})

