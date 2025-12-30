export function formatDate(date: Date): string {
    return date.toISOString()
}

export function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
}
