const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const schedule = require('node-schedule');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ===== CONFIG - Edit these =====
const CONFIG = {
  TOKEN: process.env.DISCORD_TOKEN,
  GUILD_ID: process.env.GUILD_ID,
  VOICE_CHANNEL_ID: process.env.VOICE_CHANNEL_ID,
  TEXT_CHANNEL_ID: process.env.TEXT_CHANNEL_ID,

  // War schedule (Egypt time = UTC+3)
  // Cron format: second minute hour day month weekday
  WAR_DAYS: '*', // * = every day, or use '5,6' for Fri-Sat, '1-5' for weekdays

  ANNOUNCEMENTS: [
    {
      // 9:30 PM Egypt = 18:30 UTC
      cron: '0 30 18 * * *',
      label: '⚔️ War Warning - 5 Minutes',
      message: '⚔️ **WAR STARTS IN 5 MINUTES!**\nGet ready, mount up, and head to the war zone!',
      color: 0xFFAA00,
      emoji: '⚠️',
    },
    {
      // 9:40 PM Egypt = 18:40 UTC (10 min after war start 9:35)
      cron: '0 40 18 * * *',
      label: '🌿 Jungle Spawned',
      message: '🌿 **JUNGLE IS UP!** Move to the jungle NOW!\nFirst team to clear it gets the buff advantage!',
      color: 0x00FF7F,
      emoji: '🌿',
    },
    {
      // 9:50 PM Egypt = 18:50 UTC (15 min after war start)
      cron: '0 50 18 * * *',
      label: '👹 BOSS SPAWNED',
      message: '👹 **BOSS IS UP! GO GO GO!**\nAll forces move to the Boss location immediately!',
      color: 0xFF0000,
      emoji: '🔴',
    },
  ],
};
// ===== END CONFIG =====

let warActive = false;
let scheduledJobs = [];

// --- Utility: Send embed to text channel ---
async function sendAnnouncement(announcement) {
  try {
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    if (!guild) return console.error('Guild not found');

    const textChannel = guild.channels.cache.get(CONFIG.TEXT_CHANNEL_ID);
    if (!textChannel) return console.error('Text channel not found');

    const embed = new EmbedBuilder()
      .setTitle(announcement.label)
      .setDescription(announcement.message)
      .setColor(announcement.color)
      .setTimestamp()
      .setFooter({ text: 'War Bot • Where Winds Meet' });

    await textChannel.send({ content: `@everyone ${announcement.emoji}`, embeds: [embed] });
    console.log(`[${new Date().toISOString()}] Sent: ${announcement.label}`);
  } catch (err) {
    console.error('Failed to send announcement:', err);
  }
}

// --- Utility: Join voice channel ---
async function joinVoice() {
  try {
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    if (!guild) return null;

    const voiceChannel = guild.channels.cache.get(CONFIG.VOICE_CHANNEL_ID);
    if (!voiceChannel) return null;

    const connection = joinVoiceChannel({
      channelId: CONFIG.VOICE_CHANNEL_ID,
      guildId: CONFIG.GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    console.log(`[${new Date().toISOString()}] Joined voice channel: ${voiceChannel.name}`);
    return connection;
  } catch (err) {
    console.error('Failed to join voice:', err);
    return null;
  }
}

// --- Utility: Leave voice channel ---
function leaveVoice() {
  const connection = getVoiceConnection(CONFIG.GUILD_ID);
  if (connection) {
    connection.destroy();
    console.log('Left voice channel');
  }
}

// --- Schedule all war announcements ---
function scheduleWar() {
  // Cancel existing jobs
  scheduledJobs.forEach(job => job.cancel());
  scheduledJobs = [];

  CONFIG.ANNOUNCEMENTS.forEach((ann, index) => {
    const job = schedule.scheduleJob(ann.cron, async () => {
      console.log(`Firing: ${ann.label}`);

      // First announcement = join voice + send message
      if (index === 0) {
        warActive = true;
        await joinVoice();
      }

      await sendAnnouncement(ann);
    });

    scheduledJobs.push(job);
    console.log(`Scheduled: ${ann.label} | Cron: ${ann.cron}`);
  });

  // Auto-leave voice 30 minutes after war start (customize as needed)
  const leaveJob = schedule.scheduleJob('0 5 19 * * *', () => {
    // 10:05 PM Egypt = 19:05 UTC - leaves voice after war ends
    if (warActive) {
      leaveVoice();
      warActive = false;
      console.log('War ended - left voice channel');
    }
  });
  scheduledJobs.push(leaveJob);

  console.log(`\n✅ ${scheduledJobs.length} war jobs scheduled!\n`);
}

// --- Slash Commands Handler ---
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'war-status') {
    const embed = new EmbedBuilder()
      .setTitle('⚔️ War Bot Status')
      .setDescription(warActive ? '🟢 War is currently **ACTIVE**' : '🔴 War is currently **INACTIVE**')
      .addFields(
        { name: '📅 Schedule', value: 'Every day at 9:30 PM Egypt time', inline: true },
        { name: '🔔 Announcements', value: `${CONFIG.ANNOUNCEMENTS.length} alerts scheduled`, inline: true },
      )
      .setColor(warActive ? 0x00FF00 : 0xFF0000)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (commandName === 'war-test') {
    // Admin only test command
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ Admins only!', ephemeral: true });
    }

    await interaction.reply({ content: '🧪 Testing war sequence...', ephemeral: true });
    await joinVoice();

    for (const ann of CONFIG.ANNOUNCEMENTS) {
      await sendAnnouncement(ann);
      await new Promise(r => setTimeout(r, 3000)); // 3 sec between each
    }
  }

  if (commandName === 'war-join') {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ Admins only!', ephemeral: true });
    }
    await joinVoice();
    await interaction.reply({ content: '✅ Joined voice channel!', ephemeral: true });
  }

  if (commandName === 'war-leave') {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ Admins only!', ephemeral: true });
    }
    leaveVoice();
    await interaction.reply({ content: '✅ Left voice channel!', ephemeral: true });
  }
});

// --- Bot Ready ---
client.once('ready', () => {
  console.log(`\n🤖 Bot is online as: ${client.user.tag}`);
  console.log(`📡 Connected to ${client.guilds.cache.size} server(s)`);
  console.log(`🕐 Current UTC time: ${new Date().toUTCString()}`);
  console.log(`🕐 Egypt time (UTC+3): ${new Date(Date.now() + 3 * 60 * 60 * 1000).toUTCString()}\n`);

  client.user.setActivity('⚔️ Watching for War', { type: 3 });

  scheduleWar();
});

client.login(CONFIG.TOKEN);
