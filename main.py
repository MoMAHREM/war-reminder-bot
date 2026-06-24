import discord
from discord.ext import commands, tasks
import os

TOKEN = os.environ["DISCORD_TOKEN"]
VOICE_CHANNEL_ID = int(os.environ["VOICE_CHANNEL_ID"])

intents = discord.Intents.default()
intents.message_content = True
intents.voice_states = True
intents.guilds = True

bot = commands.Bot(command_prefix="!", intents=intents)

war_active = False
remaining_minutes = 0


@bot.event
async def on_ready():
    guild = discord.Object(id=1513557989162876978)

    bot.tree.copy_global_to(guild=guild)
    synced = await bot.tree.sync(guild=guild)

    print(f"✅ Bot online: {bot.user}")
    print(f"Synced {len(synced)} commands")


@tasks.loop(minutes=5)
async def war_reminder():
    global remaining_minutes, war_active

    if not war_active:
        return

    channel = bot.get_channel(VOICE_CHANNEL_ID)

    if not channel:
        print("Voice channel not found")
        return

    vc = discord.utils.get(bot.voice_clients, guild=channel.guild)

    if not vc:
        vc = await channel.connect()

    if remaining_minutes > 0:
        if channel.guild.system_channel:
            await channel.guild.system_channel.send(
                f"⚔ الحرب تبدأ بعد {remaining_minutes} دقيقة"
            )

        remaining_minutes -= 5
    else:
        if channel.guild.system_channel:
            await channel.guild.system_channel.send("🔥 بدأت الحرب الآن!")

        war_active = False


@bot.tree.command(name="warstart", description="بدء عداد الحرب")
async def warstart(interaction: discord.Interaction, minutes: int):
    global war_active, remaining_minutes

    remaining_minutes = minutes
    war_active = True

    if not war_reminder.is_running():
        war_reminder.start()

    await interaction.response.send_message(
        f"✅ بدأ عداد الحرب لمدة {minutes} دقيقة"
    )


@bot.tree.command(name="warstop", description="إيقاف تنبيه الحرب")
async def warstop(interaction: discord.Interaction):
    global war_active
    war_active = False
    await interaction.response.send_message("⛔ تم إيقاف تنبيه الحرب")


@bot.tree.command(name="join", description="دخول الروم الصوتي")
async def join(interaction: discord.Interaction):
    member = interaction.user

    if member.voice:
        await member.voice.channel.connect()
        await interaction.response.send_message("🎤 دخلت الروم الصوتي")
    else:
        await interaction.response.send_message("❌ لازم تكون داخل روم صوتي")


@bot.tree.command(name="leave", description="الخروج من الروم الصوتي")
async def leave(interaction: discord.Interaction):
    if interaction.guild.voice_client:
        await interaction.guild.voice_client.disconnect()
        await interaction.response.send_message("👋 خرجت من الروم")


bot.run(TOKEN)
