import { client } from '../mongo-db.js';
const cooldowns = new Map();
const COOLDOWN_SECONDS = 1800; // 30 minutes hour

// Returns true if the command is in cooldown for the user, false otherwise
export function getCooldown(cmdName, cmdUserId) {
    const now = Date.now();
    const key = `${cmdName}-${cmdUserId}`;
    const lastUsed = cooldowns.get(key) || 0;
    const remaining = Math.ceil((COOLDOWN_SECONDS * 1000 - (now - lastUsed)) / 1000);
    if (now - lastUsed < COOLDOWN_SECONDS * 1000) {
        console.log(`Command ${cmdName} is on cooldown for user ${cmdUserId}. Remaining: ${remaining} seconds.`);
        return { onCooldown: true, remaining };
    } else {
        cooldowns.set(key, now);
        return { onCooldown: false, remaining: 0 };
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

// Set user's social credit to a specific amount
export async function setSocialCredit(userId, amount) {
    console.log(`Setting social credit for user ${userId} to ${amount}.`);
    const db = client.db('comradebot');
    const collection = db.collection('users');
    const updateTime = Date.now();
    await collection.updateOne(
        { userId: userId },
        { $set: { socialCredit: amount, lastUpdate: updateTime } },
        { upsert: true }
    );
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
            streakType: null,
            streakCount: 0,
            streakModifier: 1,
            lastUpdate: updateTime
        });
    }

    let [streakType, streakCount, modifier] = await getStreak(userId);
    
    let action = null;
    if (amount > 0) {
        action = 'upvote';
    } else if (amount < 0) {
        action = 'downvote';
    }

    if (streakType === action) {
        streakCount += 1; // Increment streak count
        if ((streakCount % 3) === 0) {
            modifier += 1; // Increase effect for streaks
        }
    } else if (streakType !== action) {
        streakCount = 1; // Reset streak count if action changes
        modifier = 1; // Reset modifier
    }

    // Upsert (increment socialCredit and update lastUpdate)
    amount *= modifier;
    console.log(`Updating social credit for user ${userId} by ${amount}.`);
    await collection.updateOne(
        { userId: userId },
        {
            $inc: { socialCredit: amount },
            $set: { streakType: action, streakCount: streakCount, streakModifier: modifier, lastUpdate: updateTime }
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

async function getStreak(userId) {
    console.log(`Fetching streak information for user ${userId}.`);
    const db = client.db('comradebot');
    const collection = db.collection('users');
    const user = await collection.findOne({ userId });
    return user ? [user.streakType, user.streakCount, user.streakModifier] : [null, 0, 1];
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