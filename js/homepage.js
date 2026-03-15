// Homepage JS — no carousel or interactive elements needed for now.

// Future Boxes Toggle
document.addEventListener('DOMContentLoaded', () => {
    const futureBoxesBtn = document.getElementById('future-boxes-btn');
    const futureBoxesContent = document.getElementById('future-boxes-content');

    if (futureBoxesBtn && futureBoxesContent) {
        futureBoxesBtn.addEventListener('click', () => {
            const isHidden = futureBoxesContent.style.display === 'none';
            if (isHidden) {
                futureBoxesContent.style.display = 'block';
                futureBoxesBtn.textContent = 'Ocultar futuras caixas ↑';
            } else {
                futureBoxesContent.style.display = 'none';
                futureBoxesBtn.textContent = 'Ver futuras caixas ↓';
            }
        });
    }
});
