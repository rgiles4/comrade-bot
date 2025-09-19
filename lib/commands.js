import { SlashCommandBuilder } from "discord.js";

export const commands = [
    {
        data: new SlashCommandBuilder()
            .setName('healthcheck')
            .setDescription('Check if the bot is online'),
        async execute(interaction) {
            await interaction.reply('ComradeBot is online and operational!');
        }
    },
    {
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
            await interaction.reply(`You have upvoted <@${targetUser.id}>. Their social credit has increased!`);
        }
    },
    {
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
            await interaction.reply(`You have downvoted <@${targetUser.id}>. Their social credit has decreased!`);
        }
    }
]