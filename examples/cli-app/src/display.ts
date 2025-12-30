export function displayHeader(title: string): void {
    console.log(title)
    console.log("=".repeat(title.length))
    console.log()
}

export function displayInfo(label: string, value: string): void {
    console.log(`${label} ${value}`)
}
