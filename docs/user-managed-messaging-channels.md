# User-Managed Messaging Channels for Lovera
## Senior Architecture Analysis & Implementation Plan

**Analyzed:** TinyClaw, Nanobot, Bub (3 production bot systems)
**Goal:** Enable users to receive Spark messages & automation notifications via their own WhatsApp/Telegram/Discord
**Benefit:** No central API costs, user privacy, scalability

---

## 🎯 What This Solves

### Current Setup (Centralized)
```
❌ You manage Meta Business API (complex, expensive)
❌ You manage central Telegram bot token
❌ Single point of failure
❌ All user messages go through YOUR infrastructure
❌ Privacy concerns
❌ Scaling issues
```

### New Setup (User-Managed)
```
✅ Each user scans their own WhatsApp QR code
✅ Each user creates their own Telegram bot
✅ Each user creates their own Discord bot
✅ Isolated, private, scalable
✅ Zero API costs for you
✅ Better security model
```

---

## 📊 Best Practices from Production Bots

### 1. **Base Channel Pattern** (from Nanobot)

**Why It's Good:**
- Abstract interface for all platforms
- Consistent API
- Easy to add new platforms
- Built-in security

**Implementation:**
```typescript
// lib/channels/base-channel.ts
export interface ChannelConfig {
  enabled: boolean;
  allowFrom?: string[];
}

export interface OutboundMessage {
  userId: string;
  chatId: string;
  content: string;
}

export abstract class BaseChannel {
  abstract readonly name: string;
  protected config: ChannelConfig;
  protected running: boolean = false;

  constructor(config: ChannelConfig) {
    this.config = config;
  }

  // Lifecycle
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;

  // Messaging
  abstract send(message: OutboundMessage): Promise<void>;

  // Security
  protected isAllowed(userId: string): boolean {
    const allowList = this.config.allowFrom || [];
    return allowList.length === 0 || allowList.includes(userId);
  }

  isRunning(): boolean {
    return this.running;
  }
}
```

---

### 2. **Graceful Lifecycle Management** (from all three)

**Why It's Good:**
- Automatic reconnection
- Clean shutdown
- No resource leaks

**Implementation:**
```typescript
class TelegramChannel extends BaseChannel {
  private bot: TelegramBot | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  async start(): Promise<void> {
    this.running = true;
    await this.connect();
  }

  private async connect(): Promise<void> {
    try {
      this.bot = new TelegramBot(this.config.token, { polling: true });

      this.bot.on('polling_error', (error) => {
        console.error('Polling error:', error);
        this.scheduleReconnect();
      });

      console.log('Channel started');
    } catch (error) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (!this.running) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    this.reconnectTimer = setTimeout(() => {
      console.log('Reconnecting...');
      this.connect();
    }, 5000);
  }

  async stop(): Promise<void> {
    this.running = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.bot) await this.bot.stopPolling();
  }
}
```

---

### 3. **File Sanitization** (from TinyClaw)

**Why It's Good:**
- Security (path traversal protection)
- No overwrites
- Clean organization

**Implementation:**
```typescript
class FileHandler {
  sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
      .replace(/^\.+/, '')
      .trim();
  }

  generateUniqueFilename(originalName: string): string {
    const sanitized = this.sanitizeFilename(originalName);
    const ext = path.extname(sanitized);
    const base = path.basename(sanitized, ext);

    let filename = sanitized;
    let counter = 1;

    while (fs.existsSync(path.join(this.uploadDir, filename))) {
      filename = `${base}_${counter}${ext}`;
      counter++;
    }

    return filename;
  }
}
```

---

## 🏗️ Lovera Integration Architecture

```
Lovera Backend
    ↓
Messaging Service (Singleton)
    ├─ ChannelManager (lifecycle)
    ├─ MessageRouter (routing)
    └─ NotificationQueue (delivery)
    ↓
Channel Instances (per user)
    ├─ User 1: TelegramChannel + WhatsAppChannel
    ├─ User 2: WhatsAppChannel
    └─ User 3: TelegramChannel + DiscordChannel
    ↓
External APIs (polling)
    ├─ Telegram Bot API
    ├─ WhatsApp Web Protocol
    └─ Discord Bot API
```

---

## 📋 Development Plan (6 Weeks)

### **Phase 1: Foundation (Week 1)**

#### 1.1 Database Schema
```prisma
model UserMessagingChannel {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  platform   String   // 'telegram' | 'whatsapp' | 'discord'
  enabled    Boolean  @default(true)
  config     Json     // Encrypted configuration

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  lastUsedAt DateTime?

  @@unique([userId, platform])
  @@index([userId, enabled])
}

model MessagingNotification {
  id        String   @id @default(cuid())
  userId    String
  platform  String
  type      String   // 'spark' | 'automation' | 'alert'
  content   String   @db.Text
  status    String   // 'pending' | 'sent' | 'failed'
  sentAt    DateTime?
  error     String?
  createdAt DateTime @default(now())

  @@index([userId, status])
}
```

#### 1.2 Encryption Utilities
```typescript
// lib/crypto.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, tagHex, encrypted] = encryptedText.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

**Setup:**
```bash
# Generate encryption key
node -e "console.log(crypto.randomBytes(32).toString('hex'))"

# Add to .env
ENCRYPTION_KEY=your_generated_key_here
```

---

### **Phase 2: Telegram Integration (Week 2)**

#### 2.1 Telegram Channel
```typescript
// lib/channels/telegram-channel.ts
import TelegramBot from 'node-telegram-bot-api';
import { BaseChannel, OutboundMessage } from './base-channel';

interface TelegramConfig extends ChannelConfig {
  botToken: string;
  telegramUserId?: string;
}

export class TelegramChannel extends BaseChannel {
  readonly name = 'telegram';
  private bot: TelegramBot | null = null;
  private telegramUserId: string | null = null;

  constructor(
    config: TelegramConfig,
    private userId: string,
    private onUserIdReceived: (telegramUserId: string) => Promise<void>
  ) {
    super(config);
    this.telegramUserId = config.telegramUserId || null;
  }

  async start(): Promise<void> {
    if (this.running) return;

    const config = this.config as TelegramConfig;
    this.bot = new TelegramBot(config.botToken, { polling: true });

    // Handle /start
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id.toString();

      if (!this.telegramUserId) {
        this.telegramUserId = chatId;
        await this.onUserIdReceived(chatId);
      }

      await this.bot!.sendMessage(chatId,
        '✅ Connected to Lovera!\n\n' +
        'You will receive:\n' +
        '• Daily Spark messages\n' +
        '• Automation notifications\n' +
        '• Important alerts'
      );
    });

    this.bot.on('polling_error', (error) => {
      console.error(`[Telegram:${this.userId}] Error:`, error);
    });

    this.running = true;
  }

  async stop(): Promise<void> {
    if (!this.running) return;
    if (this.bot) await this.bot.stopPolling();
    this.running = false;
  }

  async send(message: OutboundMessage): Promise<void> {
    if (!this.bot || !this.telegramUserId) {
      throw new Error('Telegram not initialized');
    }

    await this.bot.sendMessage(this.telegramUserId, message.content, {
      parse_mode: 'Markdown'
    });
  }
}
```

#### 2.2 Setup API
```typescript
// app/api/channels/telegram/setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { encrypt } from '@/lib/crypto';
import { messagingService } from '@/lib/messaging-service';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { botToken } = await req.json();

  // Validate token
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getMe`
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Invalid bot token' }, { status: 400 });
    }

    const botInfo = await response.json();

    // Save encrypted token
    await db.userMessagingChannel.upsert({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform: 'telegram'
        }
      },
      update: {
        enabled: true,
        config: {
          botToken: encrypt(botToken),
          botUsername: botInfo.result.username
        }
      },
      create: {
        userId: session.user.id,
        platform: 'telegram',
        enabled: true,
        config: {
          botToken: encrypt(botToken),
          botUsername: botInfo.result.username
        }
      }
    });

    // Start channel
    await messagingService.startTelegramChannel(session.user.id);

    return NextResponse.json({
      success: true,
      botUsername: botInfo.result.username
    });

  } catch (error) {
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
```

---

### **Phase 3: WhatsApp Integration (Week 3)**

#### 3.1 WhatsApp Channel
```typescript
// lib/channels/whatsapp-channel.ts
import { Client, LocalAuth } from 'whatsapp-web.js';
import { BaseChannel, OutboundMessage } from './base-channel';

export class WhatsAppChannel extends BaseChannel {
  readonly name = 'whatsapp';
  private client: Client | null = null;
  private phoneNumber: string | null = null;

  constructor(
    config: any,
    private userId: string,
    private onReady: (phoneNumber: string) => Promise<void>
  ) {
    super(config);
  }

  async start(onQR?: (qr: string) => void): Promise<void> {
    if (this.running) return;

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: `/data/users/${this.userId}/whatsapp`
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.client.on('qr', (qr) => {
      if (onQR) onQR(qr);
    });

    this.client.on('ready', async () => {
      const info = this.client!.info;
      this.phoneNumber = info.wid.user;
      if (this.phoneNumber) {
        await this.onReady(this.phoneNumber);
      }
    });

    this.client.on('disconnected', () => {
      this.running = false;
    });

    await this.client.initialize();
    this.running = true;
  }

  async stop(): Promise<void> {
    if (!this.running) return;
    if (this.client) await this.client.destroy();
    this.running = false;
  }

  async send(message: OutboundMessage): Promise<void> {
    if (!this.client) throw new Error('WhatsApp not initialized');

    const chatId = `${this.phoneNumber}@c.us`;
    await this.client.sendMessage(chatId, message.content);
  }
}
```

#### 3.2 Setup with SSE
```typescript
// app/api/channels/whatsapp/setup/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { messagingService } from '@/lib/messaging-service';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  messagingService.startWhatsAppChannel(
    session.user.id,
    async (qr: string) => {
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ type: 'qr', qr })}\n\n`)
      );
    },
    async (phoneNumber: string) => {
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ type: 'ready', phoneNumber })}\n\n`)
      );
      await writer.close();
    }
  );

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  });
}
```

---

### **Phase 4: Messaging Service (Week 4)**

```typescript
// lib/messaging-service.ts
import { TelegramChannel } from './channels/telegram-channel';
import { WhatsAppChannel } from './channels/whatsapp-channel';
import { BaseChannel } from './channels/base-channel';
import { db } from './db';
import { decrypt } from './crypto';

class MessagingService {
  private channels = new Map<string, BaseChannel>();

  async startTelegramChannel(userId: string): Promise<void> {
    const key = `${userId}:telegram`;
    if (this.channels.has(key)) return;

    const config = await db.userMessagingChannel.findUnique({
      where: { userId_platform: { userId, platform: 'telegram' } }
    });

    if (!config?.enabled) throw new Error('Not configured');

    const botToken = decrypt(config.config.botToken);
    const channel = new TelegramChannel(
      { ...config.config, botToken },
      userId,
      async (telegramUserId: string) => {
        await db.userMessagingChannel.update({
          where: { id: config.id },
          data: {
            config: { ...config.config, telegramUserId },
            lastUsedAt: new Date()
          }
        });
      }
    );

    await channel.start();
    this.channels.set(key, channel);
  }

  async startWhatsAppChannel(
    userId: string,
    onQR: (qr: string) => Promise<void>,
    onReady: (phone: string) => Promise<void>
  ): Promise<void> {
    const key = `${userId}:whatsapp`;
    if (this.channels.has(key)) throw new Error('Already running');

    const config = await db.userMessagingChannel.upsert({
      where: { userId_platform: { userId, platform: 'whatsapp' } },
      update: { enabled: true },
      create: {
        userId,
        platform: 'whatsapp',
        enabled: true,
        config: { sessionPath: `/data/users/${userId}/whatsapp` }
      }
    });

    const channel = new WhatsAppChannel(
      config.config,
      userId,
      async (phoneNumber: string) => {
        await db.userMessagingChannel.update({
          where: { id: config.id },
          data: {
            config: { ...config.config, phoneNumber },
            lastUsedAt: new Date()
          }
        });
        await onReady(phoneNumber);
      }
    );

    await channel.start(onQR);
    this.channels.set(key, channel);
  }

  async sendNotification(
    userId: string,
    type: 'spark' | 'automation' | 'alert',
    content: string
  ): Promise<void> {
    const channels = await db.userMessagingChannel.findMany({
      where: { userId, enabled: true }
    });

    const priority = ['telegram', 'whatsapp', 'discord'];

    for (const platform of priority) {
      const config = channels.find(c => c.platform === platform);
      if (!config) continue;

      const key = `${userId}:${platform}`;
      const channel = this.channels.get(key);

      if (channel?.isRunning()) {
        try {
          await channel.send({
            userId,
            chatId: config.config.telegramUserId || config.config.phoneNumber,
            content
          });

          await db.messagingNotification.create({
            data: {
              userId,
              platform,
              type,
              content,
              status: 'sent',
              sentAt: new Date()
            }
          });

          return;
        } catch (error) {
          console.error(`Failed ${platform}:`, error);
        }
      }
    }
  }

  async initializeAll(): Promise<void> {
    const configs = await db.userMessagingChannel.findMany({
      where: { enabled: true, platform: 'telegram' }
    });

    for (const config of configs) {
      try {
        await this.startTelegramChannel(config.userId);
      } catch (error) {
        console.error(`Failed to start ${config.platform}:`, error);
      }
    }
  }
}

export const messagingService = new MessagingService();
```

---

### **Phase 5: Frontend (Week 5)**

#### Setup Components
```typescript
// components/settings/TelegramSetup.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

export function TelegramSetup() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'waiting'>('input');

  async function handleSetup() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/channels/telegram/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: token })
      });

      if (!res.ok) throw new Error('Setup failed');

      setStep('waiting');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === 'waiting') {
    return (
      <Alert>
        ✅ Almost done! Open Telegram and send /start to your bot.
      </Alert>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-medium mb-2">Create Telegram Bot:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Open Telegram, search @BotFather</li>
          <li>Send /newbot</li>
          <li>Follow prompts</li>
          <li>Copy token</li>
        </ol>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <Input
        type="password"
        placeholder="123456:ABC-DEF..."
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />

      <Button onClick={handleSetup} disabled={loading || !token}>
        {loading ? 'Connecting...' : 'Connect Bot'}
      </Button>
    </Card>
  );
}
```

```typescript
// components/settings/WhatsAppSetup.tsx
'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function WhatsAppSetup() {
  const [qr, setQr] = useState<string | null>(null);

  async function startSetup() {
    const eventSource = new EventSource('/api/channels/whatsapp/setup');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'qr') setQr(data.qr);
      if (data.type === 'ready') {
        alert('Connected!');
        eventSource.close();
      }
    };
  }

  return (
    <div className="space-y-4">
      {!qr ? (
        <Button onClick={startSetup}>Connect WhatsApp</Button>
      ) : (
        <div>
          <QRCodeSVG value={qr} size={256} />
          <p className="mt-2 text-sm">Scan with WhatsApp</p>
        </div>
      )}
    </div>
  );
}
```

---

### **Phase 6: Integration with Lovera (Week 6)**

#### Update Spark Sender
```typescript
// lib/spark/send-spark.ts
import { messagingService } from '@/lib/messaging-service';

export async function sendSparkToUser(userId: string, sparkContent: string) {
  await messagingService.sendNotification(
    userId,
    'spark',
    `✨ Your Daily Spark\n\n${sparkContent}`
  );
}
```

#### Update Automation Notifier
```typescript
// lib/automation/notify.ts
import { messagingService } from '@/lib/messaging-service';

export async function notifyAutomationComplete(
  userId: string,
  name: string
) {
  await messagingService.sendNotification(
    userId,
    'automation',
    `✅ Automation "${name}" completed!`
  );
}
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install node-telegram-bot-api whatsapp-web.js qrcode.react
```

### 2. Setup Database
```bash
npx prisma migrate dev --name add_messaging_channels
```

### 3. Configure Encryption
```bash
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
# Add to .env: ENCRYPTION_KEY=...
```

### 4. Initialize on Server Start
```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { messagingService } = await import('@/lib/messaging-service');
    await messagingService.initializeAll();
  }
}
```

---

## 📝 Summary

### What Changes:
**Before:**
```typescript
await sendWhatsAppViaMetaAPI(phoneNumber, message);
```

**After:**
```typescript
await messagingService.sendNotification(userId, 'spark', message);
```

### Benefits:
- ✅ Zero API costs
- ✅ Better privacy
- ✅ More scalable
- ✅ User control

### Timeline:
- Week 1: Foundation
- Week 2: Telegram
- Week 3: WhatsApp
- Week 4: Messaging service
- Week 5: Frontend
- Week 6: Integration

**Total: 6 weeks**
