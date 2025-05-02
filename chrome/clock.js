export function startClock() {
    const clockElement = document.getElementById('digital-clock');
    updateClock();
    setInterval(updateClock, 1000);
    function updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        if (clockElement) clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}