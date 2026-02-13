# Messaging Setup Guide

Welcome to Luvora! This guide will help you set up your preferred messaging platform to receive daily love sparks directly to your phone or computer.

## 📱 Platform Options

Luvora supports three messaging platforms:

- **Telegram** - Fast, reliable, bot-based delivery
- **WhatsApp** - Familiar interface, QR code linking
- **Discord** - Coming soon!

Choose the platform that you and your partner use most frequently.

---

## 🔷 Telegram Setup

Setting up Telegram is quick and straightforward. You'll create your own personal bot that only you control.

### Prerequisites
- A Telegram account
- Telegram app installed on your phone or computer
- Access to [@BotFather](https://t.me/BotFather) (Telegram's official bot creator)

### Step-by-Step Instructions

#### 1. Create Your Bot

1. Open Telegram and search for **@BotFather**
2. Start a conversation by clicking **START**
3. Send the command: `/newbot`
4. BotFather will ask you to choose a name for your bot
   - Example: "My Love Sparks Bot" or "Emma's Daily Sparks"
   - This is the display name users will see
5. Choose a username for your bot
   - Must end in `bot` (e.g., `my_love_sparks_bot`)
   - Must be unique across all Telegram
   - Cannot contain spaces

#### 2. Get Your Bot Token

Once created, BotFather will send you a message containing:
- Congratulations message
- Your bot's username
- **A bot token** (long string of numbers and letters)

The token looks like this:
```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
```

⚠️ **Important**: Keep this token secret! It gives full control over your bot.

#### 3. Configure in Luvora Dashboard

1. Go to your Luvora Dashboard
2. Navigate to the **Automation** tab
3. Select **Telegram** from the platform options
4. Click **Configure Telegram Bot**
5. Copy your bot token from BotFather
6. Paste it into the token input field
7. Click **Verify Token**

If successful, you'll see: ✅ Token validated

#### 4. Link Your Bot

1. Luvora will show you your bot's username with a direct link
2. Click the link or search for your bot in Telegram
3. Open a chat with your bot
4. Send the command: `/start`

Within a few seconds, Luvora will detect the connection and show:
✅ Bot successfully linked!

#### 5. Test Your Connection

Click **Send Test Message** to receive a sample spark. If you receive it, you're all set!

### Troubleshooting Telegram

**Problem: "Invalid token" error**
- Make sure you copied the entire token (including the colon `:`)
- Check for extra spaces at the beginning or end
- Verify you got the token from @BotFather

**Problem: "Bot not linking" or stuck on "Waiting for /start"**
- Make sure you're messaging the correct bot
- Try sending `/start` again
- Check that the bot is not blocked
- Wait a few more seconds (can take up to 30 seconds)

**Problem: "Not receiving messages"**
- Ensure the bot is not muted in Telegram
- Check your Telegram notification settings
- Verify the bot is still active in @BotFather
- Try sending a test message from the dashboard

---

## 💚 WhatsApp Setup

WhatsApp setup uses QR code scanning to link your personal WhatsApp account securely.

### Prerequisites
- A WhatsApp account
- WhatsApp installed on your phone
- Camera access for QR code scanning

### Step-by-Step Instructions

#### 1. Start WhatsApp Setup

1. Go to your Luvora Dashboard
2. Navigate to the **Automation** tab
3. Select **WhatsApp** from the platform options
4. Click **Configure WhatsApp Connection**

#### 2. Scan QR Code

1. A QR code will appear on your screen
2. Open WhatsApp on your phone
3. Tap the **three dots** menu (Android) or **Settings** (iPhone)
4. Select **Linked Devices** or **WhatsApp Web**
5. Tap **Link a Device**
6. Point your camera at the QR code on your screen

#### 3. Wait for Connection

- The QR code is valid for 5 minutes
- Once scanned, the connection typically completes in 10-30 seconds
- You'll see a loading message: "Initializing WhatsApp session..."

When successful, you'll see:
✅ WhatsApp linked successfully!

Your phone number will be displayed for confirmation.

#### 4. Verify Connection

Click **Send Test Message** to receive a sample spark in your WhatsApp. If you receive it, setup is complete!

### Important WhatsApp Notes

🔒 **Security & Privacy**
- Your WhatsApp session is encrypted and stored securely
- Luvora cannot read your personal messages
- Only outgoing sparks are sent through this connection
- You can unlink at any time from WhatsApp settings

⚡ **Session Persistence**
- Once linked, you don't need to scan again
- The session persists across browser restarts
- If you see "Session expired", simply scan a new QR code

📱 **Phone Requirements**
- Your phone must have internet connection
- WhatsApp must be running on your phone (can be in background)
- If you change phones, you'll need to rescan the QR code

### Troubleshooting WhatsApp

**Problem: QR code won't scan**
- Increase screen brightness
- Make sure there's no glare on your screen
- Try moving closer or further from the screen
- Refresh the page to generate a new QR code

**Problem: "Connection timeout" or QR code expired**
- The QR code expires after 5 minutes
- Click **Regenerate QR Code** to get a new one
- Make sure your internet connection is stable

**Problem: "Failed to initialize session"**
- Clear your browser cache
- Try using a different browser (Chrome recommended)
- Disable browser extensions that might interfere
- Check that WhatsApp Web is not blocked on your network

**Problem: Not receiving messages**
- Verify the connection status shows as "Active"
- Check that you haven't blocked the number
- Ensure your phone has internet connection
- Try unlinking and relinking your device

**Problem: "Session expired" after some time**
- This can happen if you log out of all WhatsApp Web sessions
- Simply scan the QR code again to reconnect
- Your preferences and settings will be preserved

---

## 🎮 Discord Setup

Discord integration is currently in development and will be available soon!

### What to Expect

- Direct message delivery to your Discord account
- One-click OAuth authentication
- No bot creation required
- Seamless integration with your existing Discord

### Get Notified

We'll announce when Discord support launches. In the meantime, please use Telegram or WhatsApp.

---

## ⏰ Delivery Schedule

Once your messaging platform is set up, configure when you want to receive sparks:

### Morning Sparks
- Toggle: Enable/Disable morning delivery
- Time: Set your preferred morning time (e.g., 8:00 AM)
- Purpose: Start your day with love and positivity

### Evening Sparks
- Toggle: Enable/Disable evening delivery
- Time: Set your preferred evening time (e.g., 8:00 PM)
- Purpose: End your day feeling connected and cherished

### Tips for Scheduling
- Choose times when you're typically awake and can appreciate the message
- Morning sparks work great as breakfast reading or commute inspiration
- Evening sparks are perfect for winding down before bed
- You can enable both, just one, or neither (on-demand only)

---

## 🏆 Legend Features (Premium)

If you're a Legend tier member, you have access to advanced personalization:

### Love Language Preferences
Tailor messages to your partner's love language:
- **Words of Affirmation** - Heartfelt compliments and encouragement
- **Quality Time** - Focus on togetherness and presence
- **Acts of Service** - Appreciation for actions and support
- **Physical Touch** - Warmth and closeness (appropriate for text)
- **Receiving Gifts** - Thoughtful gestures and surprises

### Emotional Tone
Choose the style of your sparks:
- **Poetic** - Lyrical and artistic language
- **Playful** - Fun, lighthearted, and humorous
- **Romantic** - Classic romance and passion
- **Passionate** - Intense and deeply emotional
- **Sweet** - Gentle, tender, and caring
- **Supportive** - Encouraging and uplifting

### Special Occasions
Never miss important dates:
- **Anniversary** - Extra special messages on your anniversary
- **Partner's Birthday** - Celebrate with personalized birthday sparks
- Automatic detection and enhanced messages on these dates

---

## 🔐 Security & Privacy

### Data Protection
- All bot tokens are encrypted using AES-256-GCM encryption
- Tokens are never exposed in logs or error messages
- Your messaging credentials are stored securely in our database
- We never access your personal message history

### What We Store
- Encrypted bot tokens (Telegram)
- Encrypted session data (WhatsApp)
- Your delivery preferences
- Message delivery logs (for reliability)

### What We Don't Store
- Your personal messages on Telegram/WhatsApp/Discord
- Your contacts or chat history
- Any data beyond what's needed for spark delivery

### Your Control
- Unlink your messaging platform anytime from the dashboard
- Delete your account and all data anytime from settings
- Change your bot or reconnect WhatsApp without losing preferences
- All data deletion is immediate and permanent

---

## 💡 Best Practices

### 1. Test First
Always send a test message after setup to ensure everything works before relying on scheduled delivery.

### 2. Keep Your Phone Connected (WhatsApp Only)
WhatsApp requires your phone to have internet. If your phone is off or disconnected for extended periods, messages may be delayed.

### 3. Check Mute Settings
Make sure your bot (Telegram) or the sender (WhatsApp) is not muted, or you might miss notifications.

### 4. Update Your Preferences
As your relationship evolves, update your partner's name, love language, and tone preferences in the dashboard.

### 5. Backup Your Token (Telegram)
Save your bot token somewhere safe (like a password manager) in case you need to reconnect later.

### 6. Use Descriptive Bot Names
Name your Telegram bot something you'll recognize (e.g., "My Love Sparks Bot" rather than "Bot12345").

---

## ❓ Frequently Asked Questions

### Can I use multiple platforms at once?
Currently, you can only have one active messaging channel at a time. Choose the platform you prefer most.

### What happens if I change my phone number?
- **Telegram**: Your bot continues to work regardless of your phone number
- **WhatsApp**: You'll need to rescan the QR code with your new number

### Can my partner see my bot token?
Your bot token is private to you. However, if your partner has access to your BotFather account, they could access it. Keep your Telegram account secure.

### Will messages work if I'm offline?
Yes! Messages will be delivered when you come back online:
- **Telegram**: Messages are delivered even if you're offline, you'll see them when you open Telegram
- **WhatsApp**: Requires your phone to be online, but messages will queue and deliver when reconnected

### Can I change platforms later?
Yes! You can disconnect one platform and set up another at any time. Your preferences (schedule, love language, etc.) will be preserved.

### What if I accidentally share my bot token?
**Immediately**:
1. Go to @BotFather in Telegram
2. Find your bot
3. Use the `/revoke` command to generate a new token
4. Update the token in your Luvora dashboard

### How many messages will I receive?
- Up to 2 per day if you enable both morning and evening sparks
- Special occasions may include bonus messages (Legend tier)
- You control the frequency entirely

### Can I pause messages temporarily?
Yes! Simply disable both morning and evening toggles in your dashboard. Re-enable them whenever you're ready.

---

## 🆘 Getting Help

### Still Having Issues?

1. **Check this guide first** - Most issues have solutions listed above
2. **Test your connection** - Use the "Send Test Message" button
3. **Review your settings** - Ensure all toggles and times are correct
4. **Try disconnecting and reconnecting** - Sometimes a fresh setup helps

### Contact Support

If you're still experiencing problems:
- Email: support@luvora.com
- Include: Your platform (Telegram/WhatsApp), error messages, and what you've already tried
- Response time: Usually within 24 hours

---

## 🎉 You're All Set!

Congratulations on setting up your messaging channel! You're now ready to receive daily sparks that will keep your relationship vibrant and connected.

### What's Next?

1. ✅ **Complete your profile** - Add your partner's name and role
2. ✅ **Set your schedule** - Choose your morning/evening delivery times
3. ✅ **Customize preferences** (Legend) - Love language and tone
4. ✅ **Send a test message** - Make sure everything works
5. ✅ **Share with your partner** - Let them know you're using Luvora to keep your love alive

---

**Made with ❤️ by Luvora**

*Keeping relationships connected, one spark at a time.*
