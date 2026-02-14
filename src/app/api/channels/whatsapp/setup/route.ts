/**
 * WhatsApp Channel Setup API
 *
 * GET /api/channels/whatsapp/setup
 *
 * Server-Sent Events endpoint that streams QR codes for WhatsApp linking.
 *
 * Flow:
 * 1. Client connects to this endpoint
 * 2. Server creates WhatsApp channel instance
 * 3. QR codes are streamed as they're generated
 * 4. When linked, sends success event with phone number
 * 5. Connection closes
 *
 * Events:
 * - qr: QR code data (base64)
 * - ready: { phoneNumber: string }
 * - error: { message: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';
import { WhatsAppChannel } from '@/lib/messaging/channels/whatsapp-channel';
import path from 'path';
import QRCode from 'qrcode';

export async function GET(req: NextRequest) {
    try {
        // Get authenticated user
        const authCookie = req.cookies.get('pb_auth');
        if (!authCookie) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Load auth from cookie
        pb.authStore.loadFromCookie(authCookie.value);

        if (!pb.authStore.isValid || !pb.authStore.record) {
            return NextResponse.json(
                { error: 'Invalid session' },
                { status: 401 }
            );
        }

        const userId = pb.authStore.record.id;

        // Create Server-Sent Events stream
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const sendEvent = (event: string, data: unknown) => {
                    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
                    controller.enqueue(encoder.encode(message));
                };

                try {
                    // Session path for this user
                    // Use /tmp for serverless environments (Vercel, AWS Lambda, etc.)
                    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
                    const sessionPath = isServerless
                        ? path.join('/tmp', '.whatsapp-sessions', userId)
                        : path.join(process.cwd(), '.whatsapp-sessions', userId);

                    console.log(`[WhatsApp Setup] Session path: ${sessionPath}, Serverless: ${!!isServerless}`);

                    // Create WhatsApp channel with callbacks
                    const channel = new WhatsAppChannel(
                        {
                            enabled: true,
                            sessionPath
                        },
                        userId,
                        {
                            // QR Code callback
                            onQR: async (qr: string) => {
                                console.log(`[WhatsApp Setup] QR generated for user ${userId}`);

                                // Convert QR to base64 image
                                const qrImage = await QRCode.toDataURL(qr);
                                sendEvent('qr', { qr: qrImage });
                            },

                            // Ready callback (linked successfully)
                            onReady: async (phoneNumber: string) => {
                                console.log(`[WhatsApp Setup] Linked successfully: ${phoneNumber}`);

                                try {
                                    // Check if channel already exists
                                    const existing = await pb.collection('messaging_channels').getFullList({
                                        filter: `user="${userId}" && platform="whatsapp"`,
                                        $autoCancel: false
                                    });

                                    const channelData = {
                                        user: userId,
                                        platform: 'whatsapp',
                                        enabled: true,
                                        config: {
                                            phoneNumber,
                                            sessionPath
                                        },
                                        last_used: new Date().toISOString()
                                    };

                                    if (existing.length > 0) {
                                        // Update existing
                                        await pb.collection('messaging_channels').update(
                                            existing[0].id,
                                            channelData,
                                            { $autoCancel: false }
                                        );
                                    } else {
                                        // Create new
                                        await pb.collection('messaging_channels').create(
                                            channelData,
                                            { $autoCancel: false }
                                        );
                                    }

                                    sendEvent('ready', { phoneNumber });

                                    // Stop the channel after successful setup
                                    await channel.stop();

                                    // Close stream
                                    controller.close();

                                } catch (error) {
                                    console.error('[WhatsApp Setup] Error saving to DB:', error);
                                    sendEvent('error', {
                                        message: 'Failed to save WhatsApp configuration'
                                    });
                                    await channel.stop();
                                    controller.close();
                                }
                            }
                        }
                    );

                    // Start the channel (will trigger QR generation)
                    await channel.start();

                    // Set timeout (5 minutes)
                    setTimeout(async () => {
                        if (!channel.isLinked()) {
                            console.log(`[WhatsApp Setup] Timeout for user ${userId}`);
                            sendEvent('error', { message: 'Setup timeout. Please try again.' });
                            await channel.stop();
                            controller.close();
                        }
                    }, 5 * 60 * 1000);

                } catch (error) {
                    console.error('[WhatsApp Setup] Error:', error);
                    sendEvent('error', {
                        message: error instanceof Error ? error.message : 'Setup failed'
                    });
                    controller.close();
                }
            },

            cancel() {
                console.log('[WhatsApp Setup] Client disconnected');
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            }
        });

    } catch (error) {
        console.error('[WhatsApp Setup] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
