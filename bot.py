import discord
from discord.ext import commands, tasks
import os
import asyncio

TOKEN = os.getenv("TOKEN")
VOICE_CHANNEL_ID = int(os.getenv("VOICE_CHANNEL_ID"))

intents = discord.Intents.default()
intents.message_content = True
intents.voice_states = True
intents.guilds = True

bot = commands.Bot(command_prefix="!", intents=intents)

war_active = False
remaining_minutes = 0

@bot.event
async def on_ready():
    print(f"Bot online: {bot.user}")

@tasks.loop(minutes=5)
async def war_reminder():
    global remaining_minutes, war_active

    if not war_active:
        return

    channel = bot.get_channel(VOICE_CHANNEL_ID)
    vc = discord.utils.get(bot.voice_clients, guild=channel.guild)

    if not vc:
        vc = await channel.connect()

    if remaining_minutes > 0:
        await channel.guild.system_channel.send(
            f"⚔ الحرب تبدأ بعد {remaining_minutes} دقيقة"
        )

        vc.play(discord.FFmpegPCMAudio("war.mp3"))
        remaining_minutes -= 5
    else:
        await channel.guild.system_channel.send("🔥 بدأت الحرب الآن!")
        vc.play(discord.FFmpegPCMAudio("start.mp3"))
        war_active = False

@bot.command()
async def warstart(ctx, minutes: int):
    global war_active, remaining_minutes
    remaining_minutes = minutes
    war_active = True

    if not war_reminder.is_running():
        war_reminder.start()

    await ctx.send(f"✅ بدأ عداد الحرب لمدة {minutes} دقيقة")

@bot.command()
async def warstop(ctx):
    global war_active
    war_active = False
    await ctx.send("⛔ تم إيقاف تنبيهات الحرب")

bot.run(TOKEN)