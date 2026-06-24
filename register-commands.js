const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
    .setName('war-status')
    .setDescription('Shows current war bot status and schedule'),

  new SlashCommandBuilder()
    .setName('war-test')
    .setDescription('🔧 [ADMIN] Test all war announcements manually'),

  new SlashCommandBuilder()
    .setName('war-join')
    .setDescription('🔧 [ADMIN] Force bot to join voice channel'),

  new SlashCommandBuilder()
    .setName('war-leave')
    .setDescription('🔧 [ADMIN] Force bot to leave voice channel'),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔄 Registering slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('✅ Slash commands registered successfully!');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
})();
