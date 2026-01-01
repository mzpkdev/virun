export function formatArgs(args: string[]): string {
    return args.map((arg, i) => `   ${i + 1}. ${arg}`).join("\n")
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// Re-export from nested utils
export { formatDate, truncate } from "./utils/helpers"
export { isValidEmail, isValidUrl } from "./utils/validation"
