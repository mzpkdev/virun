import { readFileSync } from "node:fs"
import { resolve } from "node:path"

export interface PackageInfo {
    name: string
    version: string
}

export function readPackageInfo(): PackageInfo | null {
    try {
        const pkgPath = resolve(process.cwd(), "package.json")
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
        return {
            name: pkg.name,
            version: pkg.version
        }
    } catch {
        return null
    }
}
