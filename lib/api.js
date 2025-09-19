import { REST, Routes } from 'discord.js';
import { commands } from './commands.js';
import dotenv from 'dotenv';

dotenv.config();

const botToken = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const rest = new REST({ version: '10' }).setToken(botToken);
const commandData = commands.map(command => command.data.toJSON());

// Register commands with Discord API
export async function registerCommands() {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commandData },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}
    