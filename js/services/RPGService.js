class RPGService {
  constructor(storage) {
    this.storage = storage;
  }

  getXpToNextLevel(level) {
    return Math.floor(5 + Math.pow(level + 1, 1.5));
  }

  calculateXp(habit, value, targetValue, baseReward) {
    let xpEarned = 0;
    if (value >= targetValue) {
      xpEarned = baseReward;
      const streakBonus = Math.min(habit.streak * 0.05, 0.5);
      xpEarned = Math.floor(xpEarned * (1 + streakBonus));
    } else {
      xpEarned = Math.floor((value / targetValue) * baseReward);
    }
    return xpEarned;
  }

  addXp(amount) {
    const data = this.storage.load();
    data.user.xp += amount;
    data.user.totalXp += amount;

    let leveledUp = false;
    let xpNeeded = this.getXpToNextLevel(data.user.level);

    while (data.user.xp >= xpNeeded) {
      data.user.xp -= xpNeeded;
      data.user.level++;
      xpNeeded = this.getXpToNextLevel(data.user.level);
      leveledUp = true;
    }

    this.storage.save(data);
    
    if (leveledUp) {
      this.showLevelUpNotification(data.user.level);
    }

    return { leveledUp, currentLevel: data.user.level, currentXp: data.user.xp, xpNeeded };
  }

  showLevelUpNotification(level) {
    const notification = document.createElement('div');
    notification.className = 'levelUpNotification';
    notification.innerHTML = `
      <div class="levelUpContent">
        <i data-lucide="sparkles"></i>
        <div class="levelUpText">
          <h3>LEVEL UP!</h3>
          <p>You reached level ${level}!</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 4000);
  }
}

const rpgService = new RPGService(storageService);