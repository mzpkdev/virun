// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from "vitest"


describe("Browser App", () => {
    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = "<div id=\"app\"></div>"
    })

    it("should have DOM available", () => {
        const app = document.getElementById("app")
        expect(app).toBeDefined()
        expect(app?.tagName).toBe("DIV")
    })

    it("should have window and navigator", () => {
        expect(window).toBeDefined()
        expect(navigator).toBeDefined()
        expect(navigator.userAgent).toBeDefined()
    })
})

