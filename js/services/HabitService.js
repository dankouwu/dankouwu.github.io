class HabitService {
  constructor(storage, rpg) {
    this.storage = storage;
    this.rpg = rpg;
    this.habitsLibrary = null;
  }

  async loadLibrary() {
    if (!this.habitsLibrary) {
      const response = await fetch('json/habits.json');
      const data = await response.json();
      this.habitsLibrary = data.habits;
    }
    return this.habitsLibrary;
  }

  async addHabit(typeId, difficulty) {
    const library = await this.loadLibrary();
    const type = library.find(h => h.id === typeId);
    if (!type) throw new Error('Habit type not found');

    const data = this.storage.load();
    const newHabit = {
      id: crypto.randomUUID(),
      typeId: typeId,
      difficulty: difficulty,
      streak: 0,
      lastCompleted: null,
      createdAt: new Date().toISOString(),
      totalXp: 0
    };

    data.activeHabits.push(newHabit);
    this.storage.save(data);
    return newHabit;
  }

  removeHabit(habitId) {
    const data = this.storage.load();
    data.activeHabits = data.activeHabits.filter(h => h.id !== habitId);

    this.storage.save(data);
  }

  async updateProgress(habitId, value) {
    const data = this.storage.load();
    const habit = data.activeHabits.find(h => h.id === habitId);
    if (!habit) throw new Error('Habit not found');

    const library = await this.loadLibrary();
    const type = library.find(h => h.id === habit.typeId);
    
    const difficultyKey = habit.difficulty.charAt(0).toUpperCase() + habit.difficulty.slice(1);
    const targetValue = type.amount[`difficulty${difficultyKey}`];
    const baseReward = type.rewards[`difficulty${difficultyKey}`];

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayHistory = data.history.filter(h => h.habitId === habit.id && h.date === today);
    const currentValueBefore = todayHistory.reduce((sum, h) => sum + h.value, 0);


    if (currentValueBefore + value > targetValue) {
      value = Math.max(0, targetValue - currentValueBefore);
    }
    
    if (value <= 0) return { habit, xpEarned: 0, isCompleted: currentValueBefore >= targetValue };

    const totalToday = currentValueBefore + value;
    const isCompleted = totalToday >= targetValue;
    const wasAlreadyCompleted = currentValueBefore >= targetValue;


    let xpEarned = 0;
    if (isCompleted && !wasAlreadyCompleted) {
      const rawXp = this.rpg.calculateXp(habit, targetValue, targetValue, baseReward);
      const proportion = value / targetValue;
      xpEarned = Math.floor(rawXp * proportion);
    } else {
      xpEarned = this.rpg.calculateXp(habit, value, targetValue, baseReward);
    }

    if (isCompleted && !wasAlreadyCompleted) {
      if (habit.lastCompleted === yesterdayStr) {
        habit.streak++;
      } else if (habit.lastCompleted !== today) {
        habit.streak = 1;
      }
      habit.lastCompleted = today;
    }

    habit.totalXp += xpEarned;

    const historyEntry = {
      date: today,
      habitId: habitId,
      habitName: type.name,
      typeId: type.id,
      value: value,
      xpEarned: xpEarned,
      isCompleted: isCompleted
    };

    data.history.push(historyEntry);
    this.storage.save(data);
    
    const rpgUpdate = this.rpg.addXp(xpEarned);
    
    return {
      habit,
      xpEarned,
      isCompleted,
      ...rpgUpdate
    };
  }
}

const habitService = new HabitService(storageService, rpgService);