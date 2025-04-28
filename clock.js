// Clock functionality
document.addEventListener('DOMContentLoaded', function() {
    startClock();
});

// Function to update the clock
function startClock() {
    const clockElement = document.getElementById('digital-clock');
    
    // Update time immediately
    updateClock();
    
    // Then update every second
    setInterval(updateClock, 1000);
    
    function updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}