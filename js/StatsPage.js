


async function initStats() {
    const data = storageService.load();
    const weeklyData = statsService.getWeeklyActivity();
    const distribution = await statsService.getHabitDistribution();

    document.getElementById('totalXpVal').textContent = data.user.totalXp;
    document.getElementById('currentLevelVal').textContent = data.user.level;
    document.getElementById('activeQuestsVal').textContent = data.activeHabits.length;
    
    const joinedDate = new Date(data.user.joinedAt);
    document.getElementById('joinedAtVal').textContent = joinedDate.toLocaleDateString();

    Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
    new Chart(weeklyCtx, {
        type: 'line',
        data: {
            labels: weeklyData.map(d => {
                const date = new Date(d.date);
                return date.toLocaleDateString(undefined, { weekday: 'short' });
            }),
            datasets: [{
                label: 'XP Gained',
                data: weeklyData.map(d => d.xp),
                borderColor: 'rgb(120, 255, 120)',
                backgroundColor: 'rgba(120, 255, 120, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: 'rgb(120, 255, 120)',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    const distCtx = document.getElementById('distributionChart').getContext('2d');
    const distLabels = Object.keys(distribution);
    const distValues = Object.values(distribution);

    if (distValues.length === 0) {
        distLabels.push('No XP yet');
        distValues.push(1);
    }

    new Chart(distCtx, {
        type: 'doughnut',
        data: {
            labels: distLabels,
            datasets: [{
                data: distValues,
                backgroundColor: [
                    '#00b4d8', '#2ecc71', '#e74c3c', '#9b59b6', '#f1c40f', '#5b2cff'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 20 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (distLabels[0] === 'No XP yet') return ' No data';
                            let label = context.label || '';
                            if (label) label += ': ';
                            if (context.parsed !== undefined) {
                                label += context.parsed + ' XP';
                            }
                            return label;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initStats();
});