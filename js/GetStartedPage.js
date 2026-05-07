async function fetchData() {
    const response = await fetch('./json/habits.json');
    const data = await response.json();
    return data;
}

let data;

async function renderHabits(data) {
    const habitsContainer = document.querySelector('.habitContainer');
    const habitTemplate = document.querySelector('#habit-template');
    
    habitsContainer.innerHTML = '';

    data.habits.forEach((habit) => {
        const fragment = habitTemplate.content.cloneNode(true);
        
        const habitCard = fragment.querySelector('.habit');
        const habitIcon = fragment.querySelector('.habitIcon');
        const habitTitle = fragment.querySelector('.habitTitle');
        const habitDescription = fragment.querySelector('.habitDescription');
        const habitButton = fragment.querySelector('.habitButton');
        const habitButtonText = fragment.querySelector('.buttonText');

        habitCard.id = habit.id;
        habitIcon.setAttribute('data-lucide', habit.icon);
        habitTitle.textContent = habit.name;
        habitDescription.textContent = habit.description;
        
        if (habitButtonText) {
            habitButtonText.textContent = 'View Details';
        }

        habitIcon.style.color = habit.color;
        if (habitButton) {
            habitButton.style.backgroundColor = habit.accentColor;
        }
        habitsContainer.appendChild(fragment);
    });
    lucide.createIcons();
}

async function init() {

    data = await fetchData();
    await renderHabits(data);
}

init();

window.addEventListener('click', (e) => {
    const habitButton = e.target.closest('.habitButton');
    if (habitButton) {

        const habitCard = e.target.closest('.habit');
        const habitId = habitCard.id;
        const detailsElement = document.querySelector('.habitDetails');
        detailsElement.classList.remove('hidden');
        const habit = data.habits.find((h) => h.id === habitId);
        
        const habitName = habit.name;
        const habitDescription = habit.detailedDescription;
        const habitIcon = habit.icon;
        const habitUnit = habit.unit;
        const amount = habit.amount;
        const rewards = habit.rewards;

        const habitNameElement = detailsElement.querySelector('.habitName');
        const habitDescriptionElement = detailsElement.querySelector('.habitDescription');
        const habitIconElement = detailsElement.querySelector('.habitIcon');
        const habitRewardsElement = detailsElement.querySelector('.habitRewardsList');
        habitRewardsElement.innerHTML = '';

        Object.keys(amount).forEach((key) => {
            const li = document.createElement('li');
            li.classList.add(key);
            const label = key.replace('difficulty', '');
            const difficultyValue = label.toLowerCase();
            li.innerHTML = `
                <div class="difficultyInfo">
                    <p class="difficulty">${label}</p>
                    <p class="goal">${amount[key]} <span class="unit">${habitUnit}</span></p>
                    <p class="reward">${rewards[key]} <span class="xp">XP</span></p>
                </div>
                <button class="startQuestButton" data-difficulty="${difficultyValue}">Start Quest</button>
            `;
            habitRewardsElement.appendChild(li);
        });

        habitNameElement.textContent = habitName;
        habitDescriptionElement.textContent = habitDescription;
        habitIconElement.setAttribute('data-lucide', habitIcon);
        
        detailsElement.querySelectorAll('.startQuestButton').forEach(button => {
            button.onclick = async () => {
                const difficulty = button.getAttribute('data-difficulty');
                try {
                    await habitService.addHabit(habitId, difficulty);
                    alert('Quest added to your board!');
                    detailsElement.classList.add('hidden');
                } catch (error) {
                    console.error('Failed to add habit:', error);
                    alert('Failed to add quest.');
                }
            };
        });
    }
    lucide.createIcons();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const detailsElement = document.querySelector('.habitDetails');
        detailsElement.classList.add('hidden');
    }
});