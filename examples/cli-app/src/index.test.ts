import { describe, it, expect } from "vitest"
import { readFileSync }         from "node:fs"
import { resolve }              from "node:path"


describe("CLI App", () => {
    it("should read package.json successfully", () => {
        const pkgPath = resolve(process.cwd(), "package.json")
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))

        expect(pkg.name).toBeDefined()
        expect(pkg.version).toBeDefined()
    })

    it("should have correct Node.js version", () => {
        expect(process.version).toMatch(/^v\d+\.\d+\.\d+/)
    })
})

