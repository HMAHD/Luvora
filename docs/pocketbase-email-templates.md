# PocketBase Email Templates

Custom email templates for PocketBase authentication emails. These templates match the Luvora brand and are fully responsive across all devices.

## Configuration

In PocketBase Admin UI:
1. Go to **Settings > Mail settings**
2. Expand each template section
3. Replace the HTML body with the templates below
4. Save changes

---

## Template 1: Verification Email

**Subject:** `Verify your Luvora account`

**Action URL placeholder:** `{APP_URL}/_/#/auth/confirm-verification/{TOKEN}`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Verify Your Email</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-collapse: collapse !important; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        @media only screen and (max-width: 620px) {
            .container { width: 100% !important; padding: 20px 16px !important; }
            .card { padding: 32px 24px !important; }
            .heading { font-size: 22px !important; }
            .body-text { font-size: 14px !important; }
            .btn { padding: 14px 32px !important; font-size: 14px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F0F1A;">
        <tr>
            <td align="center" class="container" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; color: #EC4899; letter-spacing: 3px; font-weight: normal;">LUVORA</span>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td class="card" style="background-color: #1A1A2E; border-radius: 20px; padding: 48px 40px; border: 1px solid rgba(236, 72, 153, 0.15);">

                            <!-- Icon -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 24px;">
                                        <div style="width: 72px; height: 72px; background: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%); border-radius: 50%; line-height: 72px; text-align: center;">
                                            <span style="font-size: 32px; color: #FFFFFF;">&#9993;</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Heading -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 16px;">
                                        <h1 class="heading" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: normal; color: #FFFFFF; line-height: 1.3;">
                                            Verify Your Email
                                        </h1>
                                    </td>
                                </tr>
                            </table>

                            <!-- Body Text -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 32px;">
                                        <p class="body-text" style="margin: 0; font-size: 15px; line-height: 1.7; color: #9CA3AF; max-width: 380px;">
                                            Welcome to Luvora! Please verify your email address to start receiving daily sparks and unlock all features.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Button -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 32px;">
                                        <a href="{ACTION_URL}" class="btn" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 12px; box-shadow: 0 4px 20px rgba(236, 72, 153, 0.35);">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(156, 163, 175, 0.2) 50%, transparent 100%);"></div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Alternative Link -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 12px 0; font-size: 12px; color: #6B7280;">
                                            Or copy and paste this link:
                                        </p>
                                        <p style="margin: 0; font-size: 11px; color: #4B5563; word-break: break-all; max-width: 400px;">
                                            {ACTION_URL}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Expiry Notice -->
                    <tr>
                        <td align="center" style="padding-top: 24px;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">
                                This link expires in 2 hours.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding-top: 32px;">
                            <p style="margin: 0; font-size: 12px; color: #4B5563; line-height: 1.6;">
                                If you didn't create a Luvora account, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## Template 2: Password Reset Email

**Subject:** `Reset your Luvora password`

**Action URL placeholder:** `{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Reset Your Password</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-collapse: collapse !important; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        @media only screen and (max-width: 620px) {
            .container { width: 100% !important; padding: 20px 16px !important; }
            .card { padding: 32px 24px !important; }
            .heading { font-size: 22px !important; }
            .body-text { font-size: 14px !important; }
            .btn { padding: 14px 32px !important; font-size: 14px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F0F1A;">
        <tr>
            <td align="center" class="container" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; color: #EC4899; letter-spacing: 3px; font-weight: normal;">LUVORA</span>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td class="card" style="background-color: #1A1A2E; border-radius: 20px; padding: 48px 40px; border: 1px solid rgba(107, 114, 128, 0.2);">

                            <!-- Icon -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 24px;">
                                        <div style="width: 72px; height: 72px; background-color: rgba(107, 114, 128, 0.15); border-radius: 50%; line-height: 72px; text-align: center;">
                                            <span style="font-size: 32px;">&#128274;</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Heading -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 16px;">
                                        <h1 class="heading" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: normal; color: #FFFFFF; line-height: 1.3;">
                                            Reset Your Password
                                        </h1>
                                    </td>
                                </tr>
                            </table>

                            <!-- Body Text -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 32px;">
                                        <p class="body-text" style="margin: 0; font-size: 15px; line-height: 1.7; color: #9CA3AF; max-width: 380px;">
                                            We received a request to reset your password. Click the button below to create a new password for your account.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Button -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 32px;">
                                        <a href="{ACTION_URL}" class="btn" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 12px; box-shadow: 0 4px 20px rgba(236, 72, 153, 0.35);">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(156, 163, 175, 0.2) 50%, transparent 100%);"></div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Alternative Link -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 12px 0; font-size: 12px; color: #6B7280;">
                                            Or copy and paste this link:
                                        </p>
                                        <p style="margin: 0; font-size: 11px; color: #4B5563; word-break: break-all; max-width: 400px;">
                                            {ACTION_URL}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Expiry Notice -->
                    <tr>
                        <td align="center" style="padding-top: 24px;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">
                                This link expires in 1 hour.
                            </p>
                        </td>
                    </tr>

                    <!-- Security Notice -->
                    <tr>
                        <td align="center" style="padding-top: 24px;">
                            <p style="margin: 0; font-size: 12px; color: #4B5563; line-height: 1.6; max-width: 400px;">
                                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## Template 3: Confirm Email Change

**Subject:** `Confirm your new email address`

**Action URL placeholder:** `{APP_URL}/_/#/auth/confirm-email-change/{TOKEN}`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Confirm Email Change</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-collapse: collapse !important; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        @media only screen and (max-width: 620px) {
            .container { width: 100% !important; padding: 20px 16px !important; }
            .card { padding: 32px 24px !important; }
            .heading { font-size: 22px !important; }
            .body-text { font-size: 14px !important; }
            .btn { padding: 14px 32px !important; font-size: 14px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F0F1A;">
        <tr>
            <td align="center" class="container" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; color: #EC4899; letter-spacing: 3px; font-weight: normal;">LUVORA</span>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td class="card" style="background-color: #1A1A2E; border-radius: 20px; padding: 48px 40px; border: 1px solid rgba(59, 130, 246, 0.2);">

                            <!-- Icon -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 24px;">
                                        <div style="width: 72px; height: 72px; background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%); border-radius: 50%; line-height: 72px; text-align: center;">
                                            <span style="font-size: 32px; color: #FFFFFF;">&#9993;</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Heading -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 16px;">
                                        <h1 class="heading" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: normal; color: #FFFFFF; line-height: 1.3;">
                                            Confirm Your New Email
                                        </h1>
                                    </td>
                                </tr>
                            </table>

                            <!-- Body Text -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 24px;">
                                        <p class="body-text" style="margin: 0; font-size: 15px; line-height: 1.7; color: #9CA3AF; max-width: 380px;">
                                            You requested to change your email address. Click the button below to confirm this change.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- New Email Display -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 32px;">
                                        <div style="display: inline-block; padding: 12px 24px; background-color: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 10px;">
                                            <p style="margin: 0 0 4px 0; font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px;">New Email</p>
                                            <p style="margin: 0; font-size: 15px; color: #93C5FD; font-weight: 500;">{RECORD:email}</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Button -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 32px;">
                                        <a href="{ACTION_URL}" class="btn" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 12px; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.35);">
                                            Confirm Email Change
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(156, 163, 175, 0.2) 50%, transparent 100%);"></div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Alternative Link -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 12px 0; font-size: 12px; color: #6B7280;">
                                            Or copy and paste this link:
                                        </p>
                                        <p style="margin: 0; font-size: 11px; color: #4B5563; word-break: break-all; max-width: 400px;">
                                            {ACTION_URL}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Expiry Notice -->
                    <tr>
                        <td align="center" style="padding-top: 24px;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">
                                This link expires in 1 hour.
                            </p>
                        </td>
                    </tr>

                    <!-- Security Notice -->
                    <tr>
                        <td align="center" style="padding-top: 24px;">
                            <p style="margin: 0; font-size: 12px; color: #4B5563; line-height: 1.6; max-width: 400px;">
                                If you didn't request this change, please secure your account immediately by resetting your password.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## Template 4: OTP Email

**Subject:** `Your Luvora verification code`

**OTP placeholder:** `{OTP}`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Your Verification Code</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-collapse: collapse !important; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        @media only screen and (max-width: 620px) {
            .container { width: 100% !important; padding: 20px 16px !important; }
            .card { padding: 32px 24px !important; }
            .heading { font-size: 22px !important; }
            .body-text { font-size: 14px !important; }
            .otp-code { font-size: 36px !important; letter-spacing: 8px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F0F1A;">
        <tr>
            <td align="center" class="container" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; color: #EC4899; letter-spacing: 3px; font-weight: normal;">LUVORA</span>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td class="card" style="background-color: #1A1A2E; border-radius: 20px; padding: 48px 40px; border: 1px solid rgba(236, 72, 153, 0.15);">

                            <!-- Icon -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 24px;">
                                        <div style="width: 72px; height: 72px; background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); border-radius: 50%; line-height: 72px; text-align: center;">
                                            <span style="font-size: 32px; color: #FFFFFF;">&#128273;</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Heading -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 16px;">
                                        <h1 class="heading" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: normal; color: #FFFFFF; line-height: 1.3;">
                                            Your Verification Code
                                        </h1>
                                    </td>
                                </tr>
                            </table>

                            <!-- Body Text -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 32px;">
                                        <p class="body-text" style="margin: 0; font-size: 15px; line-height: 1.7; color: #9CA3AF; max-width: 380px;">
                                            Use the code below to complete your verification. Do not share this code with anyone.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- OTP Code -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 32px;">
                                        <div style="display: inline-block; padding: 24px 40px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%); border: 2px dashed rgba(139, 92, 246, 0.4); border-radius: 16px;">
                                            <p class="otp-code" style="margin: 0; font-family: 'SF Mono', Monaco, 'Courier New', monospace; font-size: 42px; font-weight: bold; color: #A855F7; letter-spacing: 12px;">
                                                {OTP}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(156, 163, 175, 0.2) 50%, transparent 100%);"></div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Tip -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.6;">
                                            <span style="color: #F59E0B;">Tip:</span> Luvora will never ask you for this code via phone or email. Only enter it on luvora.love
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Expiry Notice -->
                    <tr>
                        <td align="center" style="padding-top: 24px;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">
                                This code expires in 10 minutes.
                            </p>
                        </td>
                    </tr>

                    <!-- Security Notice -->
                    <tr>
                        <td align="center" style="padding-top: 24px;">
                            <p style="margin: 0; font-size: 12px; color: #4B5563; line-height: 1.6; max-width: 400px;">
                                If you didn't request this code, someone may be trying to access your account. Please secure your account.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## Template 5: Login Alert Email

**Subject:** `New login to your Luvora account`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>New Login Detected</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-collapse: collapse !important; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        @media only screen and (max-width: 620px) {
            .container { width: 100% !important; padding: 20px 16px !important; }
            .card { padding: 32px 24px !important; }
            .heading { font-size: 22px !important; }
            .body-text { font-size: 14px !important; }
            .info-box { padding: 16px !important; }
            .info-label { font-size: 10px !important; }
            .info-value { font-size: 13px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F0F1A;">
        <tr>
            <td align="center" class="container" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; color: #EC4899; letter-spacing: 3px; font-weight: normal;">LUVORA</span>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td class="card" style="background-color: #1A1A2E; border-radius: 20px; padding: 48px 40px; border: 1px solid rgba(34, 197, 94, 0.2);">

                            <!-- Icon -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 24px;">
                                        <div style="width: 72px; height: 72px; background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); border-radius: 50%; line-height: 72px; text-align: center;">
                                            <span style="font-size: 32px; color: #FFFFFF;">&#128994;</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Heading -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 16px;">
                                        <h1 class="heading" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: normal; color: #FFFFFF; line-height: 1.3;">
                                            New Login Detected
                                        </h1>
                                    </td>
                                </tr>
                            </table>

                            <!-- Body Text -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 32px;">
                                        <p class="body-text" style="margin: 0; font-size: 15px; line-height: 1.7; color: #9CA3AF; max-width: 380px;">
                                            We noticed a new login to your Luvora account. If this was you, no action is needed.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Login Details Box -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <div class="info-box" style="background-color: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 12px; padding: 20px;">

                                            <!-- Time -->
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding-bottom: 12px;">
                                                        <p class="info-label" style="margin: 0 0 4px 0; font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">When</p>
                                                        <p class="info-value" style="margin: 0; font-size: 14px; color: #D1D5DB;">{APP_NAME} Login - Just now</p>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Divider -->
                                            <div style="height: 1px; background-color: rgba(107, 114, 128, 0.2); margin-bottom: 12px;"></div>

                                            <!-- Account -->
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td>
                                                        <p class="info-label" style="margin: 0 0 4px 0; font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Account</p>
                                                        <p class="info-value" style="margin: 0; font-size: 14px; color: #D1D5DB;">{RECORD:email}</p>
                                                    </td>
                                                </tr>
                                            </table>

                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(156, 163, 175, 0.2) 50%, transparent 100%);"></div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Warning Section -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 16px 0; font-size: 14px; color: #9CA3AF;">
                                            Wasn't you?
                                        </p>
                                        <a href="{APP_URL}/_/#/auth/request-password-reset" style="display: inline-block; padding: 12px 28px; background-color: rgba(239, 68, 68, 0.15); color: #EF4444; text-decoration: none; font-weight: 500; font-size: 14px; border-radius: 10px; border: 1px solid rgba(239, 68, 68, 0.3);">
                                            Secure My Account
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding-top: 32px;">
                            <p style="margin: 0; font-size: 12px; color: #4B5563; line-height: 1.6; max-width: 400px;">
                                This is an automated security alert. You're receiving this because login alerts are enabled for your account.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## PocketBase Placeholders Reference

| Placeholder | Description |
|-------------|-------------|
| `{APP_NAME}` | Your app name (Luvora) |
| `{APP_URL}` | Your PocketBase URL |
| `{TOKEN}` | Verification/reset token |
| `{ACTION_URL}` | Complete action URL with token |
| `{OTP}` | One-time password code |
| `{RECORD:email}` | User's email address |
| `{RECORD:name}` | User's name (if available) |

---

## Configuration Steps

1. Open PocketBase Admin UI
2. Navigate to **Settings > Mail settings**
3. For each template:
   - Expand the template section
   - Update the **Subject** line
   - Paste the HTML into the **Body** field
   - Replace `{APP_URL}` with `https://luvora.love` if needed
4. Click **Save changes**
5. Send a test email to verify

---

## Testing Tips

1. Use [Mail-Tester](https://www.mail-tester.com/) to check spam score
2. Test on multiple email clients:
   - Gmail (web and mobile)
   - Outlook (desktop and web)
   - Apple Mail (macOS and iOS)
   - Yahoo Mail
3. Test in both light and dark mode where supported
4. Verify all links work correctly
5. Check mobile rendering on small screens
