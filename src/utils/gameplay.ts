export const calculateLevelReward = (level: number): number => {
    if (level < 5) return 2; if (level < 10) return 3; if (level < 20) return 4;
    if (level < 30) return 5; if (level < 40) return 6;
    return Math.floor(level / 10) + 3;
};
