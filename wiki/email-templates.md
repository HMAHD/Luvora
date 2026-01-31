# Email Templates

This document contains professionally designed email templates for Luvora. All templates are responsive and compatible with major email clients.

## Design System

### Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Pink | #EC4899 | Buttons, accents, hearts |
| Secondary Rose | #F43F5E | Gradients, highlights |
| Dark Background | #0F0F1A | Email background |
| Card Background | #1A1A2E | Content cards |
| Light Text | #FFFFFF | Headings |
| Muted Text | #9CA3AF | Body text |
| Gold Accent | #F59E0B | Premium features |

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Headings | Georgia, serif | Normal |
| Body | -apple-system, Arial | Normal |
| Accent | Georgia, serif | Italic |

---

## Template 1: Welcome Email

Sent when a new user signs up.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Luvora</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <span style="font-family: Georgia, serif; font-size: 32px; color: #EC4899; letter-spacing: 2px;">LUVORA</span>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1A1A2E 0%, #16162A 100%); border-radius: 24px; padding: 50px 40px; border: 1px solid rgba(236, 72, 153, 0.2);">

                            <!-- Heart Icon -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%); border-radius: 50%; display: inline-block; line-height: 80px; font-size: 36px;">
                                            &#10084;
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Heading -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; font-weight: normal; color: #FFFFFF;">
                                            Welcome to Luvora, {{name}}
                                        </h1>
                                    </td>
                                </tr>
                            </table>

                            <!-- Body Text -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #9CA3AF; max-width: 450px;">
                                            Your journey to deeper connection begins now. Every day, we'll deliver a spark — a message crafted to strengthen the bond with the one you love.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <a href="{{dashboard_url}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px; box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);">
                                            Get Your First Spark
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 20px 0;">
                                        <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(236, 72, 153, 0.3) 50%, transparent 100%);"></div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Feature List -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #9CA3AF;">What you can do with Luvora:</p>
                                        <p style="margin: 0; font-size: 14px; color: #D1D5DB; line-height: 2;">
                                            Receive daily personalized sparks<br>
                                            Choose your preferred message tone<br>
                                            Share beautiful streak cards<br>
                                            Set up automated delivery
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding-top: 40px;">
                            <p style="margin: 0 0 10px 0; font-size: 12px; color: #6B7280;">
                                Made with love by the Luvora team
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #4B5563;">
                                <a href="{{unsubscribe_url}}" style="color: #6B7280; text-decoration: underline;">Unsubscribe</a>
                                &nbsp;&nbsp;|&nbsp;&nbsp;
                                <a href="https://luvora.love" style="color: #6B7280; text-decoration: underline;">Visit Website</a>
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

## Template 2: Daily Spark Email

Sent daily to Hero and Legend tier users with automation enabled.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Daily Spark</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <span style="font-family: Georgia, serif; font-size: 24px; color: #EC4899; letter-spacing: 2px;">LUVORA</span>
                        </td>
                    </tr>

                    <!-- Date Badge -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <span style="display: inline-block; padding: 8px 20px; background: rgba(236, 72, 153, 0.15); color: #EC4899; font-size: 13px; border-radius: 20px; border: 1px solid rgba(236, 72, 153, 0.3);">
                                {{date}} — Day {{streak_count}} Streak
                            </span>
                        </td>
                    </tr>

                    <!-- Main Spark Card -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1A1A2E 0%, #16162A 100%); border-radius: 24px; padding: 50px 40px; border: 1px solid rgba(236, 72, 153, 0.2);">

                            <!-- Morning Label -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 25px;">
                                        <span style="font-size: 28px;">&#9728;</span>
                                        <span style="display: inline-block; vertical-align: middle; margin-left: 8px; font-size: 13px; color: #F59E0B; text-transform: uppercase; letter-spacing: 1px;">Morning Spark</span>
                                    </td>
                                </tr>
                            </table>

                            <!-- The Spark Message -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 30px 20px;">
                                        <p style="margin: 0; font-family: Georgia, serif; font-style: italic; font-size: 22px; line-height: 1.6; color: #FFFFFF; max-width: 480px;">
                                            "{{spark_message}}"
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Tone Badge -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-top: 20px;">
                                        <span style="display: inline-block; padding: 6px 16px; background: rgba(99, 102, 241, 0.15); color: #A5B4FC; font-size: 12px; border-radius: 20px;">
                                            {{tone}} tone
                                        </span>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Quick Actions -->
                    <tr>
                        <td align="center" style="padding-top: 30px;">
                            <table role="presentation" style="border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 0 8px;">
                                        <a href="{{copy_url}}" style="display: inline-block; padding: 12px 24px; background: rgba(236, 72, 153, 0.15); color: #EC4899; text-decoration: none; font-size: 14px; border-radius: 10px; border: 1px solid rgba(236, 72, 153, 0.3);">
                                            Copy Message
                                        </a>
                                    </td>
                                    <td style="padding: 0 8px;">
                                        <a href="{{share_url}}" style="display: inline-block; padding: 12px 24px; background: rgba(236, 72, 153, 0.15); color: #EC4899; text-decoration: none; font-size: 14px; border-radius: 10px; border: 1px solid rgba(236, 72, 153, 0.3);">
                                            Share Card
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Partner Reminder -->
                    <tr>
                        <td align="center" style="padding-top: 40px;">
                            <p style="margin: 0; font-size: 14px; color: #6B7280;">
                                Send this to {{partner_name}} and brighten their day.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding-top: 40px;">
                            <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(107, 114, 128, 0.3) 50%, transparent 100%); margin-bottom: 30px;"></div>
                            <p style="margin: 0 0 10px 0; font-size: 12px; color: #4B5563;">
                                <a href="{{dashboard_url}}" style="color: #6B7280; text-decoration: underline;">Dashboard</a>
                                &nbsp;&nbsp;|&nbsp;&nbsp;
                                <a href="{{settings_url}}" style="color: #6B7280; text-decoration: underline;">Settings</a>
                                &nbsp;&nbsp;|&nbsp;&nbsp;
                                <a href="{{unsubscribe_url}}" style="color: #6B7280; text-decoration: underline;">Unsubscribe</a>
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

## Template 3: Upgrade Confirmation

Sent when a user upgrades to Hero or Legend tier.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{tier_name}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <span style="font-family: Georgia, serif; font-size: 28px; color: #EC4899; letter-spacing: 2px;">LUVORA</span>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1A1A2E 0%, #16162A 100%); border-radius: 24px; padding: 50px 40px; border: 1px solid rgba(245, 158, 11, 0.3);">

                            <!-- Crown/Star Icon -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 25px;">
                                        <div style="width: 90px; height: 90px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); border-radius: 50%; display: inline-block; line-height: 90px; font-size: 42px; box-shadow: 0 8px 30px rgba(245, 158, 11, 0.4);">
                                            &#9733;
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Heading -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 15px;">
                                        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; font-weight: normal; color: #FFFFFF;">
                                            You're Now a {{tier_name}}
                                        </h1>
                                    </td>
                                </tr>
                            </table>

                            <!-- Subtitle -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 35px;">
                                        <p style="margin: 0; font-size: 16px; color: #9CA3AF;">
                                            Thank you for supporting Luvora. Your premium features are now active.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Features Unlocked -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background: rgba(245, 158, 11, 0.08); border-radius: 16px; padding: 25px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <p style="margin: 0 0 20px 0; font-size: 14px; color: #F59E0B; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
                                            Features Unlocked
                                        </p>

                                        <!-- Hero Features -->
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #D1D5DB; font-size: 14px;">
                                                    <span style="color: #22C55E; margin-right: 10px;">&#10003;</span>
                                                    Daily automation via Telegram or WhatsApp
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #D1D5DB; font-size: 14px;">
                                                    <span style="color: #22C55E; margin-right: 10px;">&#10003;</span>
                                                    All 6 emotional tones unlocked
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #D1D5DB; font-size: 14px;">
                                                    <span style="color: #22C55E; margin-right: 10px;">&#10003;</span>
                                                    30-day spark history archive
                                                </td>
                                            </tr>

                                            <!-- Legend-only features -->
                                            {{#if is_legend}}
                                            <tr>
                                                <td style="padding: 8px 0; color: #D1D5DB; font-size: 14px;">
                                                    <span style="color: #22C55E; margin-right: 10px;">&#10003;</span>
                                                    Premium exclusive messages
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #D1D5DB; font-size: 14px;">
                                                    <span style="color: #22C55E; margin-right: 10px;">&#10003;</span>
                                                    Partner linking with Love Ping
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #D1D5DB; font-size: 14px;">
                                                    <span style="color: #22C55E; margin-right: 10px;">&#10003;</span>
                                                    Photo memory cards
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #D1D5DB; font-size: 14px;">
                                                    <span style="color: #22C55E; margin-right: 10px;">&#10003;</span>
                                                    90-day spark history archive
                                                </td>
                                            </tr>
                                            {{/if}}
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-top: 35px;">
                                        <a href="{{dashboard_url}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);">
                                            Explore Your Features
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Receipt Info -->
                    <tr>
                        <td align="center" style="padding-top: 30px;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">
                                Order #{{order_id}} — {{date}}<br>
                                A receipt has been sent to {{email}}
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding-top: 40px;">
                            <p style="margin: 0; font-size: 12px; color: #4B5563;">
                                Questions? Reply to this email or visit our
                                <a href="https://luvora.love/support" style="color: #6B7280; text-decoration: underline;">support page</a>
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

## Template 4: Streak Milestone

Sent when users reach streak milestones (7, 30, 100 days).

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{streak_count}} Day Streak!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <span style="font-family: Georgia, serif; font-size: 28px; color: #EC4899; letter-spacing: 2px;">LUVORA</span>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1A1A2E 0%, #16162A 100%); border-radius: 24px; padding: 50px 40px; border: 1px solid rgba(236, 72, 153, 0.2); text-align: center;">

                            <!-- Celebration -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <span style="font-size: 48px;">&#127881;</span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Big Number -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 10px;">
                                        <span style="font-family: Georgia, serif; font-size: 72px; font-weight: bold; background: linear-gradient(135deg, #EC4899 0%, #F59E0B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                                            {{streak_count}}
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Label -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <span style="font-size: 18px; color: #D1D5DB; text-transform: uppercase; letter-spacing: 3px;">
                                            Day Streak
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Message -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 35px;">
                                        <p style="margin: 0; font-family: Georgia, serif; font-style: italic; font-size: 18px; line-height: 1.6; color: #FFFFFF; max-width: 400px;">
                                            "{{streak_count}} days of love shared, {{streak_count}} moments of connection created."
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Share CTA -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center">
                                        <a href="{{share_url}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px; box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);">
                                            Share Your Achievement
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Motivation -->
                    <tr>
                        <td align="center" style="padding-top: 30px;">
                            <p style="margin: 0; font-size: 14px; color: #9CA3AF;">
                                Keep the spark alive! Your next milestone: {{next_milestone}} days
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding-top: 40px;">
                            <p style="margin: 0; font-size: 12px; color: #4B5563;">
                                <a href="{{dashboard_url}}" style="color: #6B7280; text-decoration: underline;">View Dashboard</a>
                                &nbsp;&nbsp;|&nbsp;&nbsp;
                                <a href="{{unsubscribe_url}}" style="color: #6B7280; text-decoration: underline;">Unsubscribe</a>
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

## Template 5: Password Reset

Sent when a user requests a password reset.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <span style="font-family: Georgia, serif; font-size: 28px; color: #EC4899; letter-spacing: 2px;">LUVORA</span>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1A1A2E 0%, #16162A 100%); border-radius: 24px; padding: 50px 40px; border: 1px solid rgba(107, 114, 128, 0.3);">

                            <!-- Lock Icon -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 25px;">
                                        <div style="width: 70px; height: 70px; background: rgba(107, 114, 128, 0.2); border-radius: 50%; display: inline-block; line-height: 70px; font-size: 32px;">
                                            &#128274;
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Heading -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; font-weight: normal; color: #FFFFFF;">
                                            Reset Your Password
                                        </h1>
                                    </td>
                                </tr>
                            </table>

                            <!-- Body -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #9CA3AF; max-width: 400px;">
                                            We received a request to reset your password. Click the button below to create a new password. This link expires in 1 hour.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <a href="{{reset_url}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Alternative Link -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0; font-size: 13px; color: #6B7280;">
                                            Or copy this link:<br>
                                            <span style="color: #9CA3AF; word-break: break-all;">{{reset_url}}</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Security Notice -->
                    <tr>
                        <td align="center" style="padding-top: 30px;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280; max-width: 450px;">
                                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding-top: 40px;">
                            <p style="margin: 0; font-size: 12px; color: #4B5563;">
                                This is an automated message from Luvora.<br>
                                Please do not reply to this email.
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

## Template 6: Partner Invite

Sent when a Legend user invites their partner to connect.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You've Been Invited to Luvora</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <span style="font-family: Georgia, serif; font-size: 28px; color: #EC4899; letter-spacing: 2px;">LUVORA</span>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1A1A2E 0%, #16162A 100%); border-radius: 24px; padding: 50px 40px; border: 1px solid rgba(236, 72, 153, 0.3);">

                            <!-- Hearts Icon -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 25px;">
                                        <span style="font-size: 48px;">&#128149;</span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Heading -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; font-weight: normal; color: #FFFFFF;">
                                            {{inviter_name}} Wants to Connect
                                        </h1>
                                    </td>
                                </tr>
                            </table>

                            <!-- Body -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #9CA3AF; max-width: 420px;">
                                            {{inviter_name}} has invited you to join them on Luvora — a place for couples to share daily love messages and strengthen their bond.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Invite Code Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <div style="display: inline-block; padding: 20px 40px; background: rgba(236, 72, 153, 0.1); border: 2px dashed rgba(236, 72, 153, 0.4); border-radius: 16px;">
                                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">Your Invite Code</p>
                                            <p style="margin: 0; font-family: monospace; font-size: 24px; color: #EC4899; letter-spacing: 2px;">{{invite_code}}</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center">
                                        <a href="{{accept_url}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px; box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);">
                                            Accept Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- What is Luvora -->
                    <tr>
                        <td style="padding-top: 30px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background: rgba(255, 255, 255, 0.03); border-radius: 16px; padding: 25px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #D1D5DB; text-align: center;">
                                            With Luvora, you'll be able to:
                                        </p>
                                        <p style="margin: 0; font-size: 14px; color: #9CA3AF; text-align: center; line-height: 2;">
                                            Receive daily personalized love messages<br>
                                            Send Love Pings to each other<br>
                                            Track your relationship milestones<br>
                                            Build a streak of shared moments
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Expiry Notice -->
                    <tr>
                        <td align="center" style="padding-top: 25px;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">
                                This invitation expires in 7 days.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding-top: 40px;">
                            <p style="margin: 0; font-size: 12px; color: #4B5563;">
                                Questions? Visit <a href="https://luvora.love" style="color: #6B7280; text-decoration: underline;">luvora.love</a>
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

## Template Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `{{name}}` | User's name | Sarah |
| `{{email}}` | User's email | sarah@example.com |
| `{{partner_name}}` | Partner's name | Mike |
| `{{date}}` | Current date | January 29, 2026 |
| `{{streak_count}}` | Current streak number | 42 |
| `{{spark_message}}` | The spark content | "Every moment with you..." |
| `{{tone}}` | Message tone | Romantic |
| `{{tier_name}}` | Tier display name | Legend |
| `{{invite_code}}` | Partner invite code | LUV-ABCD-1234 |
| `{{dashboard_url}}` | Dashboard link | https://luvora.love/dashboard |
| `{{reset_url}}` | Password reset link | https://luvora.love/reset?token=... |
| `{{unsubscribe_url}}` | Unsubscribe link | https://luvora.love/unsubscribe?id=... |

---

## Implementation Notes

### Email Service Providers

These templates are compatible with:
- SendGrid
- Mailgun
- Amazon SES
- Postmark
- Resend

### Testing

1. Use [Litmus](https://litmus.com) or [Email on Acid](https://emailonacid.com) to test across clients
2. Test in Gmail, Outlook, Apple Mail, and mobile clients
3. Verify dark mode compatibility
4. Check all links work correctly

### Accessibility

- All images have alt text placeholders
- Color contrast meets WCAG AA standards
- Links are clearly distinguishable
- Text is readable at default zoom levels
