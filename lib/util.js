import { client } from '../mongo-db.js';
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
        return false; // Not on cooldown
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

// Update user's social credit by a specified amount (works for +/- using $inc)
export async function updateSocialCredit(userId, amount) {
    const db = client.db('comradebot');
    const collection = db.collection('users');
    await collection.updateOne(
        { userId: userId },
        { $inc: { socialCredit: amount } },
        { upsert: true }
    );
}

// Get user's current social credit
export async function getSocialCredit(userId) {
    const db = client.db('comradebot');
    const collection = db.collection('users');
    const user = await collection.findOne({ userId: userId });
    return user ? user.socialCredit : 0;
}

// Display the social credit leaderboard
export async function getLeaderboard(order) {
    const db = client.db('comradebot');
    const collection = db.collection('users');
    const leaderboard = await collection.find({})
        .sort({ socialCredit: order })
        .limit(10)
        .toArray();
    return leaderboard;
}