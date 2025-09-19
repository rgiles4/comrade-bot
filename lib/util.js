const cooldowns = new Map();
const COOLDOWN_SECONDS = 3600; // 1 hour

// Returns true if the command is in cooldown for the user, false otherwise
export function getCooldown(cmdName, cmdUserId) {
    const now = Date.now();
    const key = `${cmdName}-${cmdUserId}`;
    const lastUsed = cooldowns.get(key) || 0;
    if (now - lastUsed < COOLDOWN_SECONDS * 1000) {
        return true; // Still in cooldown
    } else {
        cooldowns.set(key, now);
        return false;
    }
}

// Sets the cooldown for a specific command and user
export function setCooldown(cmdName, cmdUserId) {
    const now = Date.now();
    const key = `${cmdName}-${cmdUserId}`;
    cooldowns.set(key, now);
}

// Clears the cooldown for a specific command and user
export function clearCooldown(cmdName, cmdUserId) {
    const key = `${cmdName}-${cmdUserId}`;
    cooldowns.delete(key);
}