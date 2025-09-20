import * as utilities from './util.js';
import { SlashCommandBuilder } from "discord.js";

export const commands = [
    { // Check if the bot is online
        data: new SlashCommandBuilder()
            .setName('healthcheck')
            .setDescription('Check if the bot is online'),
        async execute(interaction) {
            console.log(`${interaction.user.tag} checked bot health.`);
            await interaction.reply('ComradeBot is online and operational!');
        }
    },
    { // Upvote a user
        data: new SlashCommandBuilder()
            .setName('upvote')
            .setDescription('Upvote a user and increase their social credit')
            .addUserOption(option =>
                option.setName('target')
                    .setDescription('The user to upvote')
                    .setRequired(true)
            ),
        async execute(interaction) {
            const targetUser = interaction.options.getUser('target');
            const onCooldown = utilities.getCooldown(interaction.name, interaction.user.id);
            /*  1. Check if on cooldown FIRST
                2. Then check if self-upvote
                3. Then check if bot-upvote
                4. Finally, process the upvote */

            if (onCooldown) {
                console.log(`User ${interaction.user.id} attempted to upvote while on cooldown.`);
                await interaction.reply('You can only upvote once every hour. Please wait before upvoting again.');
                return;
            } else if (targetUser.id === interaction.user.id) {
                console.log(`User ${interaction.user.id} attempted to upvote themselves.`);
                await interaction.reply('You cannot upvote yourself!');
                utilities.clearCooldown(interaction.name, interaction.user.id);
                return;
            } else if (targetUser.bot) {
                console.log(`User ${interaction.user.id} attempted to upvote a bot.`);
                await interaction.reply('You cannot upvote a bot!');
                utilities.clearCooldown(interaction.name, interaction.user.id);
                return;
            } else {
                console.log(`User ${interaction.user.id} upvoted user ${targetUser.id}.`);  
                await interaction.reply(`You have upvoted <@${targetUser.id}>. Their social credit has increased!`);
                await utilities.updateSocialCredit(targetUser.id, 1);
                utilities.setCooldown(interaction.name, interaction.user.id);
            }
        }
    },
    { // Downvote a user
        data: new SlashCommandBuilder()
            .setName('downvote')
            .setDescription('Downvote a user and decrease their social credit')
            .addUserOption(option =>
                option.setName('target')
                    .setDescription('The user to downvote')
                    .setRequired(true)
            ),
        async execute(interaction) {
            const targetUser = interaction.options.getUser('target');
            const onCooldown = utilities.getCooldown(interaction.name, interaction.user.id);
            /*  1. Check if on cooldown FIRST
                2. Then check if self-upvote
                3. Then check if bot-upvote
                4. Finally, process the upvote */

            if (onCooldown) {
                console.log(`User ${interaction.user.id} attempted to downvote while on cooldown.`);
                await interaction.reply('You can only upvote once every hour. Please wait before upvoting again.');
                return;
            } else if (targetUser.id === interaction.user.id) {
                console.log(`User ${interaction.user.id} attempted to downvote themselves.`);
                await interaction.reply('You cannot downvote yourself!');
                utilities.clearCooldown(interaction.name, interaction.user.id);
                return;
            } else if (targetUser.bot) {
                console.log(`User ${interaction.user.id} attempted to downvote a bot.`);
                if (targetUser.id === '1418407163897839666')
                {
                    console.log('Attempted to downvote ComradeBot itself. The undesirables will be punished.');
                    await utilities.updateSocialCredit(interaction.user.id, -5);
                    await interaction.reply('Attempting to downvote ComradeBot is considered an act of sabotage. The undesirables will be punished accordingly.');
                    return;
                }
                await interaction.reply('You cannot downvote a bot!');
                utilities.clearCooldown(interaction.name, interaction.user.id);
                return;
            } else {
                console.log(`User ${interaction.user.id} downvoted user ${targetUser.id}.`);
                await interaction.reply(`You have downvoted <@${targetUser.id}>. Their social credit has decreased!`);
                await utilities.updateSocialCredit(targetUser.id, -1);
                utilities.setCooldown(interaction.name, interaction.user.id);
            }
        }
    },
    { // Check a user's social credit
        data: new SlashCommandBuilder()
            .setName('checkcredit')
            .setDescription('Check a user\'s social credit score')
            .addUserOption(option =>
                option.setName('target')
                    .setDescription('The user whose social credit you want to check')
                    .setRequired(true)
            ),
        async execute(interaction) {
            console.log(`User ${interaction.user.id} is checking social credit for user ${interaction.options.getUser('target').id}.`);
            const targetUser = interaction.options.getUser('target');
            const socialCredit = await utilities.getSocialCredit(targetUser.id);
            // Credit deduction for checking own social credit
            if (interaction.user.id === targetUser.id) {
                console.log(`Applying -1 social credit penalty to user ${interaction.user.id} for checking score.`);
                await utilities.updateSocialCredit(interaction.user.id, -1);
                await interaction.reply(`<@${targetUser.id}>'s social credit score is ${socialCredit}. \nPlease be aware that checking your social credit score has a penalty of -1 social credit point.`);
                return;
            }
            await interaction.reply(`<@${targetUser.id}>'s social credit score is ${socialCredit}.`);
            
        }
    },
    { // Show social credit leaderboard
        data: new SlashCommandBuilder()
            .setName('leaderboard')
            .setDescription('Show the social credit leaderboard'),
        async execute(interaction) {
            console.log(`User ${interaction.user.id} requested the leaderboard.`);
            const leaderboard = await utilities.getLeaderboard(-1);
            if (leaderboard.length === 0) {
                await interaction.reply('The leaderboard is currently empty.');
                return;
            }
            let leaderboardMessage = 'Social Credit Leaderboard:\n';
            leaderboard.forEach((user, index) => {
                leaderboardMessage += `${index + 1}. <@${user.userId}> : ${user.socialCredit}\n`;
            });
            await interaction.reply(leaderboardMessage);
        }
    },
    { // Show social credit loserboard
        data: new SlashCommandBuilder()
            .setName('loserboard')
            .setDescription('Show the social credit loserboard'),
        async execute(interaction) {
            console.log(`User ${interaction.user.id} requested the loserboard.`);
            const loserboard = await utilities.getLeaderboard(1);
            if (loserboard.length === 0) {
                await interaction.reply('The loserboard is currently empty.');
                return;
            }
            let loserboardMessage = 'Social Credit Loserboard:\n';
            loserboard.forEach((user, index) => {
                loserboardMessage += `${index + 1}. <@${user.userId}> : ${user.socialCredit}\n`;
            });
            await interaction.reply(loserboardMessage);
        }
    },
    { // Clear a user's social credit (admin only)
        data: new SlashCommandBuilder()
            .setName('clearcredit')
            .setDescription('Clear a user\'s social credit score (Admin only)')
            .addUserOption(option =>
                option.setName('target')
                    .setDescription('The user whose social credit you want to clear')
                    .setRequired(true)
            ),
        async execute(interaction) {
            if (!interaction.member.permissions.has('Administrator')) {
                console.log(`User ${interaction.user.id} attempted to clear social credit without permission.`);
                await interaction.reply('You do not have permission to use this command.');
                return;
            }
            console.log(`Admin ${interaction.user.id} is clearing social credit for user ${interaction.options.getUser('target').id}.`);
            const targetUser = interaction.options.getUser('target');
            await utilities.setSocialCredit(targetUser.id, 0);
            await interaction.reply(`Cleared <@${targetUser.id}>'s social credit score.`);
        }
    },
    { // Set a user's social credit to designated value (admin only)
        data: new SlashCommandBuilder()
            .setName('setcredit')
            .setDescription('Set a user\'s social credit score to a designated value (Admin only)')
            .addUserOption(option =>
                option.setName('target')
                    .setDescription('The user whose social credit you want to set')
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName('amount')
                    .setDescription('The amount to set the user\'s social credit to')
                    .setRequired(true)
            ),
        async execute(interaction) {
            if (!interaction.member.permissions.has('Administrator')) {
                console.log(`User ${interaction.user.id} attempted to set social credit without permission.`);
                await interaction.reply('You do not have permission to use this command.');
                return;
            }
            const targetUser = interaction.options.getUser('target');
            const amount = interaction.options.getInteger('amount');
            console.log(`Admin ${interaction.user.id} is setting social credit for user ${targetUser.id} to ${amount}.`);
            await utilities.setSocialCredit(targetUser.id, amount);
            await interaction.reply(`Set <@${targetUser.id}>'s social credit score to ${amount}.`);
        }
    }
];