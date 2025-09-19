import dotenv from 'dotenv';
import { connectMongo } from './mongo-db.js';
import { registerCommands } from './lib/api.js';
import { Client, GatewayIntentBits } from 'discord.js';
import { commands } from './lib/commands.js';

dotenv.config();

const clientId = process.env.CLIENT_ID;
if (!clientId) {
    throw new Error('CLIENT_ID is not defined in environment variables.');
}
const mongodbUri = process.env.MONGODB_URI;
if (!mongodbUri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
}
const botToken = process.env.BOT_TOKEN;
if (!botToken) {
    throw new Error('BOT_TOKEN is not defined in environment variables.');
}
const guildId = process.env.GUILD_ID;
if (!guildId) {
    throw new Error('GUILD_ID is not defined in environment variables.');
}

const commandMap = new Map(commands.map(cmd => [cmd.data.name, cmd])); // Map Commands to Handler
const client = new Client({ intents:
    [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('clientReady', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    registerCommands(); // Register commands on startup
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = commandMap.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing command:', error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

async function start() {
    await client.login(botToken);
    await connectMongo();
}

start();