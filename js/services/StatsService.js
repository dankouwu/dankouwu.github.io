class StatsService {
  constructor(storage) {
    this.storage = storage;
  }

  getWeeklyActivity() {
    const data = this.storage.load();
    const history = data.history;
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const stats = last7Days.map(date => {
      const dayHistory = history.filter(h => h.date === date);
      const totalXp = dayHistory.reduce((sum, entry) => sum + (entry.xpEarned || 0), 0);
      return { date, xp: totalXp };
    });

    return stats;
  }

  async getHabitDistribution() {
    const data = this.storage.load();
    const history = data.history;
    const activeHabits = data.activeHabits;
    const response = await fetch('json/habits.json');
    const libraryData = await response.json();
    const library = libraryData.habits;

    const distribution = {};
    let accountedXp = 0;

    history.forEach(entry => {
      let name = entry.habitName;
      
      if (!name) {

        const habit = activeHabits.find(h => h.id === entry.habitId);
        if (habit) {
          const type = library.find(t => t.id === habit.typeId);
          if (type) name = type.name;
        }
      }

      if (!name) name = "Other / Deleted";

      const xp = entry.xpEarned || 0;
      distribution[name] = (distribution[name] || 0) + xp;
      accountedXp += xp;
    });


    if (data.user.totalXp > accountedXp) {
      const diff = data.user.totalXp - accountedXp;
      const legacyKey = "Legacy / Other";
      distribution[legacyKey] = (distribution[legacyKey] || 0) + diff;
    }

    return distribution;
  }
}

const statsService = new StatsService(storageService);