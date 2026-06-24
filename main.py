import discord
from discord.ext import commands, tasks
from discord import app_commands
import os

TOKEN = os.getenv("DISCORD_TOKEN")
VOICE_CHANNEL_ID = int(os.getenv("VOICE_CHANNEL_ID"))
GUILD_ID = 1513557989162876978

intents = discord.Intents.default()
intents.guilds = True
intents.voice_states = True
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

war_active = False
remaining_minutes = 0


@bot.event
async def on_ready():
    try:
        guild = discord.Object(id=GUILD_ID)

        # مسح القديم
        bot.tree.clear_commands(guild=guild)

        # Sync الجديد
        synced = await bot.tree.sync(guild=guild)

        print("========== BOT READY ==========")
        print(f"Logged as: {bot.user}")
        print(f"Synced commands: {len(synced)}")
        print([cmd.name for cmd in synced])

    except Exception as e:
        print(f"Sync Error: {e}")


@tasks.loop(minutes=5)
async def war_reminder():
    global war_active, remaining_minutes

    if not war_active:
        return

    channel = bot.get_channel(VOICE_CHANNEL_ID)

    if not channel:
        print("Voice channel not found")
        return

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


# ---------------- COMMANDS ---------------- #

@bot.tree.command(name="warstart", description="بدء عداد الحرب")
@app_commands.describe(minutes="عدد الدقائق")
async def warstart(interaction: discord.Interaction, minutes: int):
    global war_active, remaining_minutes

    war_active = True
    remaining_minutes = minutes

    if not war_reminder.is_running():
        war_reminder.start()

    await interaction.response.send_message(
        f"✅ بدأ العداد لمدة {minutes} دقيقة"
    )


@bot.tree.command(name="warstop", description="إيقاف عداد الحرب")
async def warstop(interaction: discord.Interaction):
    global war_active

    war_active = False

    await interaction.response.send_message(
        "⛔ تم إيقاف العداد"
    )


@bot.tree.command(name="join", description="دخول الروم الصوتي")
async def join(interaction: discord.Interaction):
    if interaction.user.voice:
        await interaction.user.voice.channel.connect()
        await interaction.response.send_message("🎤 دخلت الروم")
    else:
        await interaction.response.send_message("❌ ادخل روم صوتي أولاً")


@bot.tree.command(name="leave", description="الخروج من الروم الصوتي")
async def leave(interaction: discord.Interaction):
    if interaction.guild.voice_client:
        await interaction.guild.voice_client.disconnect()
        await interaction.response.send_message("👋 خرجت من الروم")


bot.run(TOKEN)
