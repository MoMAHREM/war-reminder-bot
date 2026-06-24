# ⚔️ Where Winds Meet - War Reminder Bot

بوت ديسكورد لتذكيرات الحرب في لعبة Where Winds Meet

---

## 📋 الـ Schedule الافتراضي (بتوقيت مصر UTC+3)

| الوقت | الحدث |
|-------|-------|
| 9:30 م | البوت يدخل الفويس ويعلن: الحرب بعد 5 دقايق |
| 9:40 م | الجانجل طلعت - اتحركوا! |
| 9:50 م | البوس طلع - روحوا ليه! |
| 10:05 م | البوت يخرج من الفويس |

---

## 🚀 طريقة التشغيل

### الخطوة 1: إعداد Bot على Discord Developer Portal

1. روح على https://discord.com/developers/applications
2. اضغط **New Application** وسمّيه
3. من القائمة الجانبية اضغط **Bot**
4. اضغط **Reset Token** وانسخ الـ Token
5. فعّل الـ Privileged Intents دي:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### الخطوة 2: دعوة البوت للسيرفر

في نفس الصفحة اضغط **OAuth2 > URL Generator**:
- Scopes: ✅ `bot`, ✅ `applications.commands`
- Bot Permissions: ✅ `Send Messages`, ✅ `Connect`, ✅ `Speak`, ✅ `Use Voice Activity`, ✅ `Mention Everyone`

انسخ الـ URL وافتحه في المتصفح لدعوة البوت.

### الخطوة 3: إعداد الـ Environment Variables

انسخ ملف `.env.example` وسمّيه `.env`:
```
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
VOICE_CHANNEL_ID=your_voice_channel_id
TEXT_CHANNEL_ID=your_text_channel_id
```

**إزاي تجيب الـ IDs؟**
- فعّل Developer Mode في Discord: Settings > Advanced > Developer Mode
- كليك يمين على السيرفر > Copy Server ID = GUILD_ID
- كليك يمين على القناة الصوتية > Copy Channel ID = VOICE_CHANNEL_ID
- كليك يمين على القناة النصية > Copy Channel ID = TEXT_CHANNEL_ID

### الخطوة 4: تشغيل البوت

```bash
npm install
node register-commands.js   # مرة واحدة بس لتسجيل الأوامر
npm start
```

---

## 🔧 تعديل التوقيتات

في ملف `index.js`، في قسم `CONFIG.ANNOUNCEMENTS` كل announcement عنده `cron`:

```
'0 30 18 * * *'
 ↑  ↑  ↑
 ث  د  س (UTC)
```

**مصر UTC+3 يعني تطرح 3 ساعات:**
- 9:30 م مصر = 6:30 م UTC = `0 30 18 * * *`
- 9:40 م مصر = 6:40 م UTC = `0 40 18 * * *`
- 9:50 م مصر = 6:50 م UTC = `0 50 18 * * *`

---

## 💬 أوامر البوت

| الأمر | الوصف |
|-------|-------|
| `/war-status` | يعرض حالة البوت والجدول |
| `/war-test` | [أدمن] يختبر كل الإعلانات دلوقتي |
| `/war-join` | [أدمن] يدخل الفويس يدوياً |
| `/war-leave` | [أدمن] يخرج من الفويس يدوياً |

---

## ☁️ الاستضافة على Railway (مجاناً)

1. اعمل حساب على https://railway.app
2. اضغط **New Project > Deploy from GitHub repo**
3. وصّل الـ GitHub Repo بتاعك
4. من **Variables** أضف كل متغيرات الـ `.env`
5. خلاص - البوت هيشتغل 24/7 مجاناً!

---

## 🆚 ليه Railway وليس Replit؟

| | Replit | Railway |
|--|--------|---------|
| يوقف لو مفيش نشاط | ✅ (بيوقف) | ❌ (مش بيوقف) |
| مجاني | محدود | $5 رصيد شهري مجاناً |
| سهل الإعداد | ✅ | ✅ |
| موثوق | ❌ | ✅ |
