


class StorageService {
  constructor() {
    this.key = 'lvl1_store';
  }

  load() {
    const data = localStorage.getItem(this.key);
    if (!data) {
      return this.initialize();
    }
    return JSON.parse(data);
  }

  save(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  clear() {
    localStorage.removeItem(this.key);
    return this.initialize();
  }

  initialize() {
    const defaultData = {
      user: {
        level: 1,
        xp: 0,
        totalXp: 0,
        joinedAt: new Date().toISOString()
      },
      activeHabits: [],
      history: []
    };
    this.save(defaultData);
    return defaultData;
  }
}

const storageService = new StorageService();