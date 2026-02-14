# Messaging Channels Authentication Fix - Testing Guide

## Summary of Changes

I've identified and fixed the root cause of the authentication failures for Telegram, WhatsApp, and Discord messaging channels.

### Root Cause
The authentication cookie (`pb_auth`) was not being properly set before API requests were made. The cookie setting was happening asynchronously (fire-and-forget) without waiting for completion, causing subsequent API calls to fail with "Not authenticated" errors.

### Files Modified

1. **[src/lib/auth.ts](src/lib/auth.ts#L127-L160)** - Fixed cookie setting to AWAIT completion
   - Changed from `.then()` fire-and-forget to proper `await`
   - Added error handling for cookie setting failures
   - Ensures cookie is set before returning from `verifyOTP()`

2. **[src/app/api/auth/set-cookie/route.ts](src/app/api/auth/set-cookie/route.ts#L23-L43)** - Enhanced logging
   - Added detailed logging including userId, email, cookie preview
   - Improved debugging output

3. **[src/lib/auth-helpers.ts](src/lib/auth-helpers.ts#L53-L76)** - Improved cookie parsing
   - Added dual parsing strategy (encoded and decoded)
   - Added comprehensive debugging logs
   - Better error messages

4. **[src/app/api/channels/telegram/setup/route.ts](src/app/api/channels/telegram/setup/route.ts#L21-L38)** - Enhanced debugging
   - Added detailed logging at each step
   - Clear visibility into authentication process

## Testing Instructions

### Step 1: Restart Development Server

```bash
# Kill the current dev server
# Then restart it to pick up all changes
npm run dev
# or
bun dev
```

### Step 2: Clear Browser State

1. Open Developer Tools (F12)
2. Go to Application tab → Storage → Clear all storage
3. Refresh the page

**OR** use Incognito/Private browsing mode

### Step 3: Login Fresh

1. Navigate to login page
2. Enter your email
3. Request OTP code
4. Enter the code from your email

**Watch the browser console for:**
```
✅ Auth cookie set successfully
```

If you see this message, the cookie is now properly set!

### Step 4: Test Telegram Setup

1. Go to Dashboard → Messaging Channels → Telegram
2. Click "Setup Telegram"
3. Enter your bot token (from @BotFather)
4. Click "Connect Bot"

**Watch the terminal (where `npm run dev` is running) for:**

```
🔵 [Telegram Setup] New request received
🔐 [Telegram Setup] Authenticating request...
🔍 Server received cookies: { count: X, names: [...], hasPbAuth: true }
📋 Parsed cookie data: { hasToken: true, hasModel: true, userId: '...' }
✅ [Telegram Setup] Authenticated user: <your-user-id>
```

**If successful, you'll see:**
- No "Not authenticated" errors
- Bot username displayed
- "Link Your Account" step appears

### Step 5: Test WhatsApp QR Generation

1. Go to Dashboard → Messaging Channels → WhatsApp
2. Click "Generate QR Code"

**Watch for:**
- QR code appears (not "connection closed" error)
- Terminal shows authentication success

### Step 6: Test Discord Setup

1. Go to Dashboard → Messaging Channels → Discord
2. Enter your Discord bot token
3. Click "Connect Bot"

**Watch for:**
- Same authentication success pattern as Telegram

## Debugging Output Reference

### Successful Authentication Flow

**Browser Console:**
```
OTP verification successful: { userId: '...', email: '...' }
✅ Auth cookie set successfully
```

**Server Terminal:**
```
✅ Server set pb_auth cookie: {
  hasToken: true,
  userId: '...',
  userEmail: '...',
  cookieLength: 450,
  cookiePreview: '{"token":"eyJhbGci..."...'
}
```

### Successful Messaging Channel Setup

**Server Terminal:**
```
🔵 [Telegram Setup] New request received
🔐 [Telegram Setup] Authenticating request...
🔍 Server received cookies: { count: 2, names: [ '__next_hmr_refresh_hash__', 'pb_auth' ], hasPbAuth: true }
📋 Parsed cookie data: { hasToken: true, hasModel: true, userId: 'xyz123' }
✅ [Telegram Setup] Authenticated user: xyz123
```

## Common Issues & Solutions

### Issue 1: "Not authenticated - missing auth cookie"

**Terminal shows:**
```
🔍 Server received cookies: { count: 1, names: [ '__next_hmr_refresh_hash__' ], hasPbAuth: false }
```

**Solution:**
1. Clear browser cookies
2. Login again
3. Verify you see "✅ Auth cookie set successfully" in browser console

### Issue 2: "Malformed authentication cookie"

**Cause:** Cookie parsing failed

**Solution:**
1. Check if ENCRYPTION_KEY in .env.local is valid (64 hex characters)
2. Restart dev server
3. Clear browser cookies and login again

### Issue 3: Cookie set but still not authenticated

**Check:**
1. Are you using `credentials: 'include'` in fetch calls? (Already fixed in code)
2. Is the cookie domain/path correct? (Should be automatic)
3. Check browser Application tab → Cookies → localhost → pb_auth should exist

## Environment Variables Checklist

Verify your `.env.local` has:

```bash
# PocketBase
NEXT_PUBLIC_POCKETBASE_URL=https://api.luvora.love

# Encryption (MUST be 64 hex characters)
ENCRYPTION_KEY=<your-64-character-hex-key>

# NO DUPLICATE ENCRYPTION_KEY entries!
```

**Verify:**
```bash
# Should return exactly 1 line
grep -c "^ENCRYPTION_KEY=" .env.local
```

## Next Steps

1. Follow testing instructions above
2. Report results:
   - ✅ Login successful + cookie set?
   - ✅ Telegram setup successful?
   - ✅ WhatsApp QR generation successful?
   - ✅ Discord setup successful?

3. If all successful, I'll commit and push the changes

## Technical Details

### Cookie Flow

1. **Login (OTP verification)**
   ```
   Client → verifyOTP() → authWithOTP() → PocketBase
   PocketBase → Returns auth token + user model
   Client → POST /api/auth/set-cookie { token, model }
   Server → cookies().set('pb_auth', ...) → Response
   Client ← Cookie set successfully
   ```

2. **API Request (e.g., Telegram setup)**
   ```
   Client → POST /api/channels/telegram/setup { botToken }
         → Cookie 'pb_auth' sent automatically (credentials: 'include')
   Server → authenticateRequest(req)
         → req.cookies.get('pb_auth')
         → Parse and validate
         → Create PocketBase instance with auth
   Server → Process request with authenticated PB
   Client ← Success response
   ```

### Why This Fix Works

**Before:**
- `verifyOTP()` called `/api/auth/set-cookie` but didn't wait
- User navigated/clicked immediately
- API request sent BEFORE cookie was set
- Server: "No pb_auth cookie found" → 401 error

**After:**
- `verifyOTP()` AWAITS `/api/auth/set-cookie`
- Cookie guaranteed to be set before function returns
- User can navigate/click safely
- API request includes pb_auth cookie
- Server: Successfully authenticates → 200 OK

---

**Created:** 2025-02-14
**Status:** Ready for testing
