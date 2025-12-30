#!/usr/bin/env node

import { formatArgs } from "./utils.js"
import { readPackageInfo } from "./package.js"
import { displayHeader, displayInfo } from "./display.js"


function main() {
    const args = process.argv.slice(2)

    displayHeader("🔧 CLI App")

    // Read package.json
    const pkg = readPackageInfo()
    if (pkg) {
        displayInfo("📦 Package:", pkg.name)
        displayInfo("🏷️  Version:", pkg.version)
        console.log()
    } else {
        console.log("⚠️  Could not read package.json\n")
    }

    // Show arguments
    if (args.length > 0) {
        console.log("📝 Arguments:")
        console.log(formatArgs(args))
        console.log()
    } else {
        console.log("💡 No arguments provided")
        console.log("   Try: node dist/index.js hello world\n")
    }

    displayInfo("🕐 Current time:", new Date().toISOString())
    displayInfo("🔧 Node version:", process.version)
}

main()

