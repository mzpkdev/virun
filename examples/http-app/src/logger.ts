export function log(message: string): void {
    console.log(`[${new Date().toISOString()}] ${message}`)
}

export function logError(error: Error | string): void {
    const message = error instanceof Error ? error.message : error
    console.error(`[ERROR] ${message}`)
}
