# Comrade-Bot
Comrade Bot is a simple Discord app that maintains a user-driven social credit system. Users can upvote and downvote other members of a Discord server by running commands, and impact their social standing on the leaderboards.

## Commands

### Social Credit Commands
1. /upvote [target]
    
    Increase the target's social credit by 1. Cannot be used on yourself or bots. Cooldown of 1hr

2. /downvote [target]

    Decrease the target's social credit by 1. Cannot be used on yourself or bots. Cooldown of 1hr

3. /checkcredit [target]

    Check target's social credit. Checking your own social credit charges a penalty.

### Social Credit Admin Only
1. /clearcredit [target]

    Set target's social credit to 0.

2. /setcredit [target] [amount]

    Set target's social credit to amount.

### Misc. Commands
1. /leaderboard

    Displays the server's 10 users with the highest social credit.

2. /loserboard

    Displays the server's 10 users with the lowest social credit.

3. /healthcheck

    Checks if the bot is alive by simply returning a chat response.