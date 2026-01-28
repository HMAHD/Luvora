import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getCategoryBySlug } from '@/lib/seo-categories';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const streak = searchParams.get('streak');

  // If streak is provided, generate streak share card
  if (streak) {
    return generateStreakCard(parseInt(streak, 10), searchParams.get('name') || 'My Love');
  }

  // If category is provided, generate category OG image
  if (category) {
    const cat = getCategoryBySlug(category);
    if (cat) {
      return generateCategoryCard(cat.h1, cat.description, cat.target, cat.timeOfDay);
    }
  }

  // Default Luvora OG image
  return generateDefaultCard();
}

function generateDefaultCard() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            right: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: '#78350f',
              marginBottom: 20,
              textShadow: '2px 2px 0 rgba(255,255,255,0.5)',
            }}
          >
            Luvora
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#92400e',
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Daily Spark for Your Partner
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#a16207',
              marginTop: 20,
              opacity: 0.8,
            }}
          >
            Fresh romantic messages delivered every day
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function generateCategoryCard(
  title: string,
  description: string,
  target: string,
  timeOfDay: string
) {
  // Color schemes based on target
  const colors =
    target === 'feminine'
      ? {
          bg1: '#fce7f3',
          bg2: '#fbcfe8',
          bg3: '#f9a8d4',
          text: '#831843',
          subtext: '#9d174d',
        }
      : target === 'masculine'
      ? {
          bg1: '#dbeafe',
          bg2: '#bfdbfe',
          bg3: '#93c5fd',
          text: '#1e3a8a',
          subtext: '#1e40af',
        }
      : {
          bg1: '#d1fae5',
          bg2: '#a7f3d0',
          bg3: '#6ee7b7',
          text: '#064e3b',
          subtext: '#047857',
        };

  const icon = timeOfDay === 'morning' ? '☀️' : timeOfDay === 'night' ? '🌙' : '❤️';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${colors.bg1} 0%, ${colors.bg2} 50%, ${colors.bg3} 100%)`,
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 60,
            maxWidth: 1000,
          }}
        >
          {/* Icon */}
          <div style={{ fontSize: 60, marginBottom: 20 }}>{icon}</div>

          {/* Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              color: colors.text,
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 26,
              color: colors.subtext,
              textAlign: 'center',
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            {description.length > 100 ? description.slice(0, 100) + '...' : description}
          </div>

          {/* Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 40,
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: colors.text,
                opacity: 0.7,
              }}
            >
              Luvora
            </div>
            <div
              style={{
                fontSize: 20,
                color: colors.subtext,
                opacity: 0.6,
              }}
            >
              Daily Spark
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function generateStreakCard(streak: number, name: string) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #06b6d4 100%)',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          {/* Flame icon */}
          <div style={{ fontSize: 50, marginBottom: 10 }}>🔥</div>

          {/* Streak number */}
          <div
            style={{
              fontSize: 140,
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1,
              textShadow: '4px 4px 0 rgba(0,0,0,0.2)',
            }}
          >
            {streak}
          </div>

          {/* Days label */}
          <div
            style={{
              fontSize: 36,
              color: 'rgba(255,255,255,0.9)',
              marginTop: 10,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 4,
            }}
          >
            Day Streak
          </div>

          {/* Dedication */}
          <div
            style={{
              fontSize: 24,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 30,
              fontStyle: 'italic',
            }}
          >
            Celebrating {name}
          </div>

          {/* Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 40,
              background: 'rgba(255,255,255,0.2)',
              padding: '10px 24px',
              borderRadius: 50,
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              Luvora
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
