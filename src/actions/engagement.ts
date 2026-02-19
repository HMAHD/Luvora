'use server';

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

// Initialize PocketBase with admin auth
async function getAdminPb() {
  const adminPb = new PocketBase(PB_URL);
  await adminPb.admins.authWithPassword(
    process.env.POCKETBASE_ADMIN_EMAIL || '',
    process.env.POCKETBASE_ADMIN_PASSWORD || ''
  );
  return adminPb;
}

/** Verify the caller is an authenticated user, return their ID */
async function verifyAuthenticatedUser(): Promise<string> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('pb_auth');
  if (!authCookie?.value) throw new Error('Not authenticated');

  let cookieData;
  try {
    cookieData = JSON.parse(authCookie.value);
  } catch {
    cookieData = JSON.parse(decodeURIComponent(authCookie.value));
  }

  const pb = new PocketBase(PB_URL);
  pb.authStore.save(cookieData.token, cookieData.model);

  if (!pb.authStore.isValid || !pb.authStore.record) {
    throw new Error('Invalid session');
  }

  return pb.authStore.record.id;
}

/** Verify the caller is an authenticated admin */
async function verifyAdmin(): Promise<string> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('pb_auth');
  if (!authCookie?.value) throw new Error('Not authenticated');

  let cookieData;
  try {
    cookieData = JSON.parse(authCookie.value);
  } catch {
    cookieData = JSON.parse(decodeURIComponent(authCookie.value));
  }

  const pb = new PocketBase(PB_URL);
  pb.authStore.save(cookieData.token, cookieData.model);

  if (!pb.authStore.isValid || !pb.authStore.record) {
    throw new Error('Invalid session');
  }

  const email = pb.authStore.record.email;
  const isAdmin = pb.authStore.record.is_admin || ADMIN_EMAILS.includes(email);
  if (!isAdmin) throw new Error('Admin access required');

  return pb.authStore.record.id;
}

/** Sanitize a value for PocketBase filter strings */
function sanitizeFilterValue(value: string): string {
  return value.replace(/["\\\n\r]/g, '');
}

// Types
interface UserEngagement {
  id: string;
  user_id: string;
  total_copies: number;
  total_shares: number;
  streak_days: number;
  longest_streak: number;
  last_activity: string;
  last_copy_date: string;
  created: string;
  updated: string;
}

interface AtRiskUser {
  id: string;
  email: string;
  name?: string;
  tier: number;
  days_inactive: number;
  last_activity: string;
  engagement_score: number;
}

interface EngagementStats {
  totalActiveUsers: number;
  atRiskUsers: AtRiskUser[];
  averageStreak: number;
  topEngagers: Array<{
    userId: string;
    email: string;
    copies: number;
    streak: number;
  }>;
}

/**
 * Track user activity (copy/share)
 */
export async function trackUserActivity(
  userId: string,
  activityType: 'copy' | 'share'
): Promise<void> {
  try {
    // Verify caller is authenticated and only tracking their own activity
    const callerId = await verifyAuthenticatedUser();
    if (callerId !== userId) throw new Error('Cannot track activity for other users');

    const pb = await getAdminPb();
    const today = new Date().toISOString().split('T')[0];

    const sanitizedUserId = sanitizeFilterValue(userId);

    // Try to get existing engagement record
    let engagement: UserEngagement | null = null;
    try {
      const records = await pb.collection('user_engagement').getFullList({
        filter: `user_id = "${sanitizedUserId}"`,
      });
      engagement = records[0] as unknown as UserEngagement;
    } catch {
      // Collection might not exist or no record found
    }

    if (engagement) {
      // Update existing record
      const lastCopyDate = engagement.last_copy_date?.split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Calculate streak
      let newStreak = engagement.streak_days;
      if (lastCopyDate === yesterdayStr) {
        // Consecutive day - increase streak
        newStreak += 1;
      } else if (lastCopyDate !== today) {
        // Missed days - reset streak (unless already copied today)
        newStreak = 1;
      }
      // If lastCopyDate === today, keep current streak

      const updateData: Record<string, unknown> = {
        last_activity: new Date().toISOString(),
        streak_days: newStreak,
        longest_streak: Math.max(engagement.longest_streak || 0, newStreak),
      };

      if (activityType === 'copy') {
        updateData.total_copies = (engagement.total_copies || 0) + 1;
        updateData.last_copy_date = new Date().toISOString();
      } else {
        updateData.total_shares = (engagement.total_shares || 0) + 1;
      }

      await pb.collection('user_engagement').update(engagement.id, updateData);
    } else {
      // Create new engagement record
      await pb.collection('user_engagement').create({
        user_id: userId,
        total_copies: activityType === 'copy' ? 1 : 0,
        total_shares: activityType === 'share' ? 1 : 0,
        streak_days: 1,
        longest_streak: 1,
        last_activity: new Date().toISOString(),
        last_copy_date: activityType === 'copy' ? new Date().toISOString() : null,
      });
    }
  } catch (error) {
    console.error('Failed to track user activity:', error);
    // Don't throw - engagement tracking should not break the app
  }
}

/**
 * Get engagement statistics for admin dashboard
 */
export async function getEngagementStats(): Promise<EngagementStats> {
  try {
    await verifyAdmin();
    const pb = await getAdminPb();

    // Get all users
    const users = await pb.collection('users').getFullList();

    // Get all engagement records
    let engagementRecords: UserEngagement[] = [];
    try {
      engagementRecords = await pb.collection('user_engagement').getFullList() as unknown as UserEngagement[];
    } catch {
      // Collection might not exist
    }

    // Create engagement map
    const engagementMap = new Map<string, UserEngagement>();
    engagementRecords.forEach((record) => {
      engagementMap.set(record.user_id, record);
    });

    // Calculate at-risk users (no activity in 7+ days)
    const now = new Date();
    const atRiskUsers: AtRiskUser[] = [];
    let totalActiveUsers = 0;
    let totalStreak = 0;
    let streakCount = 0;

    const topEngagers: Array<{
      userId: string;
      email: string;
      copies: number;
      streak: number;
    }> = [];

    users.forEach((user: Record<string, unknown>) => {
      const engagement = engagementMap.get(user.id as string);

      if (engagement) {
        const lastActivity = new Date(engagement.last_activity);
        const daysSinceActivity = Math.floor(
          (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Calculate engagement score (0-100)
        const engagementScore = Math.min(
          100,
          (engagement.streak_days * 5) +
          (engagement.total_copies * 2) +
          (engagement.total_shares * 3)
        );

        if (daysSinceActivity <= 7) {
          totalActiveUsers++;
        }

        // Track streaks
        if (engagement.streak_days > 0) {
          totalStreak += engagement.streak_days;
          streakCount++;
        }

        // Add to top engagers
        topEngagers.push({
          userId: user.id as string,
          email: user.email as string,
          copies: engagement.total_copies || 0,
          streak: engagement.streak_days || 0,
        });

        // Identify at-risk users (7+ days inactive, has some history)
        if (daysSinceActivity >= 7 && engagement.total_copies >= 3) {
          atRiskUsers.push({
            id: user.id as string,
            email: user.email as string,
            name: user.partner_name as string || undefined,
            tier: (user.tier as number) ?? 0,
            days_inactive: daysSinceActivity,
            last_activity: engagement.last_activity,
            engagement_score: engagementScore,
          });
        }
      } else {
        // User has no engagement record - check if they signed up recently
        const created = new Date(user.created as string);
        const daysSinceSignup = Math.floor(
          (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceSignup >= 3) {
          // Signed up 3+ days ago but never engaged
          atRiskUsers.push({
            id: user.id as string,
            email: user.email as string,
            name: user.partner_name as string || undefined,
            tier: (user.tier as number) ?? 0,
            days_inactive: daysSinceSignup,
            last_activity: user.created as string,
            engagement_score: 0,
          });
        }
      }
    });

    // Sort at-risk by days inactive (most at-risk first)
    atRiskUsers.sort((a, b) => b.days_inactive - a.days_inactive);

    // Sort top engagers by copies
    topEngagers.sort((a, b) => b.copies - a.copies);

    return {
      totalActiveUsers,
      atRiskUsers: atRiskUsers.slice(0, 20), // Top 20 at-risk
      averageStreak: streakCount > 0 ? Math.round(totalStreak / streakCount) : 0,
      topEngagers: topEngagers.slice(0, 10), // Top 10 engagers
    };
  } catch (error) {
    console.error('Failed to get engagement stats:', error);
    return {
      totalActiveUsers: 0,
      atRiskUsers: [],
      averageStreak: 0,
      topEngagers: [],
    };
  }
}

/**
 * Get user's personal engagement metrics
 */
export async function getUserEngagement(userId: string): Promise<UserEngagement | null> {
  try {
    const callerId = await verifyAuthenticatedUser();
    if (callerId !== userId) throw new Error('Cannot access other user engagement');

    const pb = await getAdminPb();
    const sanitizedUserId = sanitizeFilterValue(userId);
    const records = await pb.collection('user_engagement').getFullList({
      filter: `user_id = "${sanitizedUserId}"`,
    });
    return records[0] as unknown as UserEngagement || null;
  } catch {
    return null;
  }
}

/**
 * Send re-engagement email to at-risk users
 */
export async function triggerReengagementEmails(): Promise<{
  sent: number;
  failed: number;
  skipped: number;
}> {
  try {
    await verifyAdmin();
    const pb = await getAdminPb();
    const stats = await getEngagementStats();

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const user of stats.atRiskUsers) {
      try {
        // Check if we've already sent a re-engagement email recently
        const recentEmails = await pb.collection('reengagement_logs').getFullList({
          filter: `user_id = "${user.id}" && created > "${getDateDaysAgo(7)}"`,
        });

        if (recentEmails.length > 0) {
          skipped++;
          continue;
        }

        // In production, this would send an actual email via your email service
        // For now, we just log the re-engagement attempt
        await pb.collection('reengagement_logs').create({
          user_id: user.id,
          email: user.email,
          days_inactive: user.days_inactive,
          email_type: getEmailType(user.days_inactive),
          status: 'sent',
        });

        sent++;
      } catch (error) {
        console.error(`Failed to send re-engagement email to ${user.email}:`, error);
        failed++;
      }
    }

    return { sent, failed, skipped };
  } catch (error) {
    console.error('Failed to trigger re-engagement emails:', error);
    return { sent: 0, failed: 0, skipped: 0 };
  }
}

// Helper functions
function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function getEmailType(daysInactive: number): string {
  if (daysInactive >= 30) return 'win_back';
  if (daysInactive >= 14) return 'miss_you';
  return 'gentle_reminder';
}
