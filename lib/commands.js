import * as utilities from './util.js';
import { SlashCommandBuilder } from "discord.js";

export const commands = [
    { // Check if the bot is online
        data: new SlashCommandBuilder()
            .setName('healthcheck')
            .setDescription('Check if the bot is online'),
        async execute(interaction) {
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
                await interaction.reply('You can only upvote once every hour. Please wait before upvoting again.');
                return;
            } else if (targetUser.id === interaction.user.id) {
                await interaction.reply('You cannot upvote yourself!');
                utilities.clearCooldown(interaction.name, interaction.user.id);
                return;
            } else if (targetUser.bot) {
                await interaction.reply('You cannot upvote a bot!');
                utilities.clearCooldown(interaction.name, interaction.user.id);
                return;
            } else {
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
                await interaction.reply('You can only upvote once every hour. Please wait before upvoting again.');
                return;
            } else if (targetUser.id === interaction.user.id) {
                await interaction.reply('You cannot downvote yourself!');
                utilities.clearCooldown(interaction.name, interaction.user.id);
                return;
            } else if (targetUser.bot) {
                await interaction.reply('You cannot downvote a bot!');
                utilities.clearCooldown(interaction.name, interaction.user.id);
                return;
            } else {
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
            const targetUser = interaction.options.getUser('target');
            const socialCredit = await utilities.getSocialCredit(targetUser.id);
            await interaction.reply(`<@${targetUser.id}>'s social credit score is ${socialCredit}.`);
        }
    },
    { // Show social credit leaderboard
        data: new SlashCommandBuilder()
            .setName('leaderboard')
            .setDescription('Show the social credit leaderboard'),
        async execute(interaction) {
            const leaderboard = await utilities.getLeaderboard(-1);
            if (leaderboard.length === 0) {
                await interaction.reply('The leaderboard is currently empty.');
                return;
            }
            let leaderboardMessage = 'Social Credit Leaderboard:\n';
            leaderboard.forEach((user, index) => {
                leaderboardMessage += `${index + 1}. <@${user.userId}> - ${user.socialCredit}\n`;
            });
            await interaction.reply(leaderboardMessage);
        }
    },
    { // Show social credit loserboard
        data: new SlashCommandBuilder()
            .setName('loserboard')
            .setDescription('Show the social credit loserboard'),
        async execute(interaction) {
            const loserboard = await utilities.getLeaderboard(1);
            if (loserboard.length === 0) {
                await interaction.reply('The loserboard is currently empty.');
                return;
            }
            let loserboardMessage = 'Social Credit Loserboard:\n';
            loserboard.forEach((user, index) => {
                loserboardMessage += `${index + 1}. <@${user.userId}> - ${user.socialCredit}\n`;
            });
            await interaction.reply(loserboardMessage);
        }
    }
]