export interface RankEntry {
    rank: number;
    name: string;
    level: number;
    isPlayer: boolean;
}

const adjectives = ["Brave", "Swift", "Clever", "Mighty", "Wise", "Epic", "Golden", "Shadow", "Lost", "Ancient"];
const nouns = ["Knight", "Wizard", "Rogue", "Apple", "Hero", "Adventurer", "Phantom", "Golem", "Dragon", "Star"];

const generateRandomName = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 900) + 100;
    return `${adj}${noun}${num}`;
};

const generateFakeLeaderboard = (): Omit<RankEntry, 'rank' | 'isPlayer'>[] => {
    const entries: Omit<RankEntry, 'rank' | 'isPlayer'>[] = [];
    for (let i = 0; i < 999; i++) {
        let level;
        const rand = Math.random();
        if (rand < 0.01) { // Top 1%
            level = Math.floor(200 + Math.random() * 300);
        } else if (rand < 0.1) { // Top 10%
            level = Math.floor(80 + Math.random() * 120);
        } else if (rand < 0.4) { // Next 30%
            level = Math.floor(20 + Math.random() * 60);
        } else { // Bottom 60%
            level = Math.floor(1 + Math.random() * 19);
        }
        entries.push({ name: generateRandomName(), level });
    }
    return entries;
};

export const getLeaderboard = (playerName: string, highestLevel: number): RankEntry[] => {
    const cacheKey = 'appleAdventure3DLeaderboard';
    let cachedData: Omit<RankEntry, 'rank' | 'isPlayer'>[] = [];
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            cachedData = JSON.parse(cached);
        }
    } catch (e) {
        console.error("Could not parse leaderboard cache", e);
    }
    
    if (cachedData.length < 999) {
        cachedData = generateFakeLeaderboard();
        localStorage.setItem(cacheKey, JSON.stringify(cachedData));
    }

    const fullList = [...cachedData, { name: playerName, level: highestLevel }];

    fullList.sort((a, b) => b.level - a.level);

    return fullList.slice(0, 1000).map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isPlayer: entry.name === playerName && entry.level === highestLevel
    }));
};
