import { client } from '../mongo-db.js';
const cooldowns = new Map();
const COOLDOWN_SECONDS = 3600; // 1 hour

// Returns true if the command is in cooldown for the user, false otherwise
export function getCooldown(cmdName, cmdUserId) {
    const now = Date.now();
    const key = `${cmdName}-${cmdUserId}`;
    const lastUsed = cooldowns.get(key) || 0;
    if (now - lastUsed < COOLDOWN_SECONDS * 1000) {
        console.log(`Command ${cmdName} is on cooldown for user ${cmdUserId}.`);
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
    console.log(`Set cooldown for ${cmdUserId} at ${now}`);
}

// Clears the cooldown for a specific command and user
export function clearCooldown(cmdName, cmdUserId) {
    const key = `${cmdName}-${cmdUserId}`;
    cooldowns.delete(key);
    console.log(`Cleared cooldown for ${cmdUserId}`);
}

// Update user's social credit by a specified amount (works for +/- using $inc)
export async function updateSocialCredit(userId, amount) {
    const db = client.db('comradebot');
    const collection = db.collection('users');
    const updateTime = Date.now();

    const user = await collection.findOne({ userId: userId });
    if (!user) {
        console.log('User not found, creating new user document.');
        // Create the document first
        await collection.insertOne({
            userId: userId,
            socialCredit: 0,
            lastUpdate: updateTime
        });
    }
    // Upsert (increment socialCredit and update lastUpdate)
    console.log(`Updating social credit for user ${userId} by ${amount}.`);
    await collection.updateOne(
        { userId: userId },
        {
            $inc: { socialCredit: amount },
            $set: { lastUpdate: updateTime }
        },
        { upsert: true }
    );
}

// Get user's current social credit
export async function getSocialCredit(userId) {
    console.log(`Fetching social credit for user ${userId}.`);
    const db = client.db('comradebot');
    const collection = db.collection('users');
    const user = await collection.findOne({ userId: userId });
    return user ? user.socialCredit : 0;
}

// Display the social credit leaderboard
export async function getLeaderboard(order) {
    console.log(`Fetching leaderboard in order: ${order}.`);
    const db = client.db('comradebot');
    const collection = db.collection('users');
    const leaderboard = await collection.find({})
        .sort({ socialCredit: order })
        .limit(10)
        .toArray();
    return leaderboard;
}