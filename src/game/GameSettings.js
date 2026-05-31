export const DIFFICULTY = {
    EASY: 1,
    NORMAL: 2,
    HARD: 3
};

const STORAGE_KEY = 'escape-the-code:difficulty';
const BONUS_STORAGE_KEY = 'escape-the-code:bonus-unlocked';

export function normalizeDifficulty (value)
{
    const n = Number(value);
    if (n === DIFFICULTY.EASY || n === DIFFICULTY.NORMAL || n === DIFFICULTY.HARD) return n;
    return DIFFICULTY.NORMAL;
}

export function getStoredDifficulty ()
{
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DIFFICULTY.HARD;
    return normalizeDifficulty(raw);
}

export function setStoredDifficulty (value)
{
    const normalized = normalizeDifficulty(value);
    window.localStorage.setItem(STORAGE_KEY, String(normalized));
    return normalized;
}

export function difficultyLabel (value)
{
    const normalized = normalizeDifficulty(value);
    if (normalized === DIFFICULTY.EASY) return 'Facile';
    if (normalized === DIFFICULTY.HARD) return 'Difficile';
    return 'Normal';
}

export function getBonusUnlocked ()
{
    return window.localStorage.getItem(BONUS_STORAGE_KEY) === '1';
}

export function setBonusUnlocked (unlocked)
{
    window.localStorage.setItem(BONUS_STORAGE_KEY, unlocked ? '1' : '0');
    return unlocked;
}
