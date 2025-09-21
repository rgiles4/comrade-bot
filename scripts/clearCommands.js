// Automated script to unregister all commands (both global and guild-specific)
// Must be run while the bot is offline
// Usage: node scripts/clearCommands.js

import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const botToken = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const rest = new REST({ version: '10' }).setToken(botToken);

async function deleteAllCommands() {
  // Delete global commands
  const globalCommands = await rest.get(Routes.applicationCommands(clientId));
  for (const cmd of globalCommands) {
    await rest.delete(Routes.applicationCommand(clientId, cmd.id));
    console.log(`Deleted global command: ${cmd.name}`);
  }

  // Delete guild commands
  const guildCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));
  for (const cmd of guildCommands) {
    await rest.delete(Routes.applicationGuildCommand(clientId, guildId, cmd.id));
    console.log(`Deleted guild command: ${cmd.name}`);
  }
}

deleteAllCommands().catch(console.error);
