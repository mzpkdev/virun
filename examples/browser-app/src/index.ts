interface AppState {
    clickCount: number;
    startTime: Date;
}

function createApp(): void {
    const app = document.getElementById("app")
    if (!app) {
        throw new Error("App element not found")
    }
    console.log("!oooo")

    const i = 77777

    const state: AppState = {
        clickCount: i + 2,
        startTime: new Date()
    }

    function updateUI(): void {
        const elapsed = Math.floor((new Date().getTime() - state.startTime.getTime()) / 1000)

        app!.innerHTML = `
      <h1>🌐 Browser App</h1>
      <p>Welcome to the browser example app!</p>
      
      <div class="info">
        <div class="info-item">
          <strong>🕐 Current Time:</strong> ${new Date().toLocaleString()}
        </div>
        <div class="info-item">
          <strong>⏱️ Uptime:</strong> ${elapsed} seconds
        </div>
        <div class="info-item">
          <strong>🖱️ Clicks:</strong> ${state.clickCount}
        </div>
        <div class="info-item">
          <strong>🌍 User Agent:</strong> ${navigator.userAgent.split(" ")[0]}...
        </div>
        <div class="info-item">
          <strong>📱 Viewport:</strong> ${window.innerWidth} × ${window.innerHeight}px
        </div>
      </div>
      
      <button id="clickBtn">Click Me!</button>
    `

        const button = document.getElementById("clickBtn")
        if (button) {
            button.addEventListener("click", () => {
                state.clickCount++
                updateUI()
            })
        }
    }

    // Initial render
    updateUI()

    // Update time every second
    setInterval(() => {
        updateUI()
    }, 1000)
}

// Initialize app when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createApp)
} else {
    createApp()
}

