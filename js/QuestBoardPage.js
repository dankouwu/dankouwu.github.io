async function renderQuestBoard() {

    const container = document.querySelector('.questContainer');
    const template = document.querySelector('#habitCardTemplate');
    const data = storageService.load();

    const library = await habitService.loadLibrary();

    container.innerHTML = '';

    if (data.activeHabits.length === 0) {
        container.innerHTML = '<p class="emptyMessage">Your quest board is empty. <a href="get-started.html">Start your journey here!</a></p>';
        return;
    }

    data.activeHabits.forEach(habit => {
        const type = library.find(t => t.id === habit.typeId);
        if (!type) return;

        const clone = template.content.cloneNode(true);
        const article = clone.querySelector('.habit');
        const icon = clone.querySelector('.habitIcon');
        const title = clone.querySelector('.habitTitle');
        const badge = clone.querySelector('.habitBadge');
        const description = clone.querySelector('.habitDescription');
        const xpText = clone.querySelector('.habitXp');
        const xpUnit = clone.querySelector('.habitXpUnit');
        const progressFill = clone.querySelector('.progressBarFill');
        const streakCount = clone.querySelector('.streakCount');
        const input = clone.querySelector('.progressInput');
        const updateBtn = clone.querySelector('.updateProgressBtn');
        const removeBtn = clone.querySelector('.removeHabitBtn');

        const difficultyKey = habit.difficulty.charAt(0).toUpperCase() + habit.difficulty.slice(1);
        const targetValue = type.amount[`difficulty${difficultyKey}`];

        title.textContent = type.name;
        badge.textContent = habit.difficulty;
        badge.classList.add(habit.difficulty);
        description.textContent = type.description;
        icon.setAttribute('data-lucide', type.icon);
        icon.style.color = type.color;
        
        const today = new Date().toISOString().split('T')[0];
        const todayHistory = data.history.filter(h => h.habitId === habit.id && h.date === today);
        const currentValue = todayHistory.reduce((sum, h) => sum + h.value, 0);
        
        const remaining = Math.max(0, targetValue - currentValue);
        const isCompleted = currentValue >= targetValue;

        xpText.textContent = `${currentValue} / ${targetValue}`;
        xpUnit.textContent = type.unit;
        
        const progressPercent = Math.min((currentValue / targetValue) * 100, 100);
        progressFill.style.width = `${progressPercent}%`;
        progressFill.style.background = `linear-gradient(90deg, ${type.color}, ${type.accentColor})`;

        streakCount.textContent = habit.streak;

        if (isCompleted) {
            input.disabled = true;
            updateBtn.disabled = true;
            updateBtn.textContent = 'Done';
            input.value = '';
        } else {
            updateBtn.textContent = 'Log';
            input.max = remaining;
            input.placeholder = `Max ${remaining}`;
            
            updateBtn.onclick = async () => {
                const val = parseFloat(input.value);
                if (isNaN(val) || val <= 0) return;
                
                if (val > remaining) {
                    alert(`Maximum allowed value is ${remaining}`);
                    return;
                }
                
                await habitService.updateProgress(habit.id, val);
                renderQuestBoard();
                const navbar = document.querySelector('app-navbar');
                if (navbar && navbar.updateStats) {
                    navbar.updateStats();
                }
            };
        }

        removeBtn.onclick = () => {
            if (confirm(`Are you sure you want to remove ${type.name}?`)) {
                habitService.removeHabit(habit.id);
                renderQuestBoard();
            }
        };

        container.appendChild(clone);
    });

    lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    renderQuestBoard();
    
    const exportBtn = document.querySelector('#exportBtn');
    const resetBtn = document.querySelector('#resetBtn');
    const importFile = document.querySelector('#importFile');

    if (exportBtn) {
        exportBtn.onclick = () => {
            const data = storageService.load();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lvl1_backup.json';
            a.click();
            URL.revokeObjectURL(url);
        };
    }

    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
                storageService.clear();
                window.location.reload();
            }
        };
    }

    if (importFile) {
        importFile.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.user && data.activeHabits && data.history) {
                        storageService.save(data);
                        alert('Data imported successfully!');
                        window.location.reload();
                    } else {
                        alert('Invalid data format.');
                    }
                } catch (error) {
                    alert('Error parsing file.');
                }
            };
            reader.readAsText(file);
        };
    }
});