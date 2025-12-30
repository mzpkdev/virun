import { describe, it, expect } from "vitest"
import { createServer }         from "node:http"


describe("HTTP App", () => {
    it("should create HTTP server", () => {
        const server = createServer((req, res) => {
            res.end("test")
        })

        expect(server).toBeDefined()
        expect(server.listen).toBeInstanceOf(Function)

        // Clean up
        server.close()
    })

    it("should handle environment variables", () => {
        const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000

        expect(PORT).toBeGreaterThan(0)
        expect(PORT).toBeLessThan(65536)
    })
})

