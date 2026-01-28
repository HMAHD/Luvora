/**
 * SEO Categories Configuration
 * Defines all programmatic SEO pages for high-intent romantic search traffic
 */

export type SEOCategory = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  timeOfDay: 'morning' | 'night' | 'both';
  target: 'neutral' | 'feminine' | 'masculine';
  vibe?: 'poetic' | 'playful' | 'minimal';
  keywords: string[];
};

export const SEO_CATEGORIES: SEOCategory[] = [
  // Morning Messages - For Her
  {
    slug: 'morning-messages-for-her',
    title: 'Good Morning Messages for Her | Sweet Texts for Your Girlfriend',
    description: 'Send beautiful good morning messages to your girlfriend or wife. Fresh romantic texts delivered daily to make her smile.',
    h1: 'Good Morning Messages for Her',
    timeOfDay: 'morning',
    target: 'feminine',
    keywords: ['good morning texts for her', 'morning messages girlfriend', 'sweet morning texts wife', 'romantic morning messages'],
  },
  {
    slug: 'romantic-morning-texts-for-girlfriend',
    title: 'Romantic Morning Texts for Girlfriend | Daily Love Messages',
    description: 'Wake her up with romantic morning texts. Curated love messages to brighten her day and show you care.',
    h1: 'Romantic Morning Texts for Your Girlfriend',
    timeOfDay: 'morning',
    target: 'feminine',
    keywords: ['romantic texts girlfriend', 'love messages morning', 'cute morning texts', 'girlfriend good morning'],
  },
  {
    slug: 'sweet-good-morning-messages-wife',
    title: 'Sweet Good Morning Messages for Wife | Daily Love Notes',
    description: 'Show your wife you care with sweet good morning messages. Thoughtful texts to start her day with love.',
    h1: 'Sweet Good Morning Messages for Your Wife',
    timeOfDay: 'morning',
    target: 'feminine',
    keywords: ['good morning wife', 'sweet messages wife', 'morning love notes', 'wife morning texts'],
  },

  // Morning Messages - For Him
  {
    slug: 'morning-messages-for-him',
    title: 'Good Morning Messages for Him | Texts for Your Boyfriend',
    description: 'Send sweet good morning messages to your boyfriend or husband. Daily texts to make him feel loved.',
    h1: 'Good Morning Messages for Him',
    timeOfDay: 'morning',
    target: 'masculine',
    keywords: ['good morning texts for him', 'morning messages boyfriend', 'texts for husband morning', 'romantic morning messages him'],
  },
  {
    slug: 'romantic-good-morning-texts-boyfriend',
    title: 'Romantic Good Morning Texts for Boyfriend | Love Messages',
    description: 'Start his day with romantic good morning texts. Curated messages to show your boyfriend how much you care.',
    h1: 'Romantic Good Morning Texts for Your Boyfriend',
    timeOfDay: 'morning',
    target: 'masculine',
    keywords: ['romantic texts boyfriend', 'morning love messages him', 'cute texts boyfriend', 'boyfriend good morning'],
  },
  {
    slug: 'good-morning-messages-husband',
    title: 'Good Morning Messages for Husband | Daily Love Texts',
    description: 'Beautiful good morning messages for your husband. Make him feel appreciated every day.',
    h1: 'Good Morning Messages for Your Husband',
    timeOfDay: 'morning',
    target: 'masculine',
    keywords: ['good morning husband', 'husband morning texts', 'love messages husband', 'husband appreciation texts'],
  },

  // Goodnight Messages - For Her
  {
    slug: 'goodnight-texts-for-her',
    title: 'Goodnight Texts for Her | Sweet Night Messages Girlfriend',
    description: 'Send sweet goodnight texts to your girlfriend or wife. Romantic messages to end her day perfectly.',
    h1: 'Goodnight Texts for Her',
    timeOfDay: 'night',
    target: 'feminine',
    keywords: ['goodnight texts her', 'night messages girlfriend', 'sweet dreams texts', 'romantic goodnight messages'],
  },
  {
    slug: 'romantic-goodnight-messages-girlfriend',
    title: 'Romantic Goodnight Messages for Girlfriend | Night Texts',
    description: 'End her day with romantic goodnight messages. Beautiful texts to help her drift off to sweet dreams.',
    h1: 'Romantic Goodnight Messages for Your Girlfriend',
    timeOfDay: 'night',
    target: 'feminine',
    keywords: ['goodnight girlfriend', 'romantic night texts', 'sweet dreams girlfriend', 'nighttime love messages'],
  },
  {
    slug: 'goodnight-messages-wife',
    title: 'Goodnight Messages for Wife | Sweet Night Texts',
    description: 'Beautiful goodnight messages for your wife. Show her love before she sleeps.',
    h1: 'Goodnight Messages for Your Wife',
    timeOfDay: 'night',
    target: 'feminine',
    keywords: ['goodnight wife', 'night messages wife', 'sweet dreams wife', 'wife goodnight texts'],
  },

  // Goodnight Messages - For Him
  {
    slug: 'goodnight-texts-for-him',
    title: 'Goodnight Texts for Him | Night Messages for Boyfriend',
    description: 'Send sweet goodnight texts to your boyfriend or husband. End his day with love.',
    h1: 'Goodnight Texts for Him',
    timeOfDay: 'night',
    target: 'masculine',
    keywords: ['goodnight texts him', 'night messages boyfriend', 'sweet dreams texts him', 'goodnight messages boyfriend'],
  },
  {
    slug: 'romantic-goodnight-messages-boyfriend',
    title: 'Romantic Goodnight Messages for Boyfriend | Sweet Texts',
    description: 'Romantic goodnight messages to send your boyfriend. Make him smile before he sleeps.',
    h1: 'Romantic Goodnight Messages for Your Boyfriend',
    timeOfDay: 'night',
    target: 'masculine',
    keywords: ['goodnight boyfriend', 'romantic night texts him', 'sweet dreams boyfriend', 'boyfriend goodnight'],
  },
  {
    slug: 'goodnight-messages-husband',
    title: 'Goodnight Messages for Husband | Night Love Texts',
    description: 'Sweet goodnight messages for your husband. End his day feeling loved and appreciated.',
    h1: 'Goodnight Messages for Your Husband',
    timeOfDay: 'night',
    target: 'masculine',
    keywords: ['goodnight husband', 'night texts husband', 'husband sweet dreams', 'husband night messages'],
  },

  // Vibe-Based Categories
  {
    slug: 'poetic-love-messages',
    title: 'Poetic Love Messages | Beautiful Romantic Quotes',
    description: 'Discover beautiful poetic love messages. Elegant and heartfelt romantic quotes for your special someone.',
    h1: 'Poetic Love Messages',
    timeOfDay: 'both',
    target: 'neutral',
    vibe: 'poetic',
    keywords: ['poetic love messages', 'romantic poetry', 'beautiful love quotes', 'elegant love texts'],
  },
  {
    slug: 'playful-love-texts',
    title: 'Playful Love Texts | Fun & Cute Messages for Partner',
    description: 'Lighthearted and playful love texts. Fun messages to make your partner laugh and smile.',
    h1: 'Playful Love Texts',
    timeOfDay: 'both',
    target: 'neutral',
    vibe: 'playful',
    keywords: ['playful love texts', 'funny love messages', 'cute texts partner', 'fun romantic messages'],
  },
  {
    slug: 'minimal-love-notes',
    title: 'Minimal Love Notes | Short & Sweet Messages',
    description: 'Simple yet powerful love notes. Short messages that say everything without saying too much.',
    h1: 'Minimal Love Notes',
    timeOfDay: 'both',
    target: 'neutral',
    vibe: 'minimal',
    keywords: ['short love messages', 'minimal love notes', 'simple love texts', 'brief romantic messages'],
  },

  // General Categories
  {
    slug: 'daily-love-messages',
    title: 'Daily Love Messages | Fresh Romantic Texts Every Day',
    description: 'Get a fresh love message every day. Never run out of romantic things to say to your partner.',
    h1: 'Daily Love Messages',
    timeOfDay: 'both',
    target: 'neutral',
    keywords: ['daily love messages', 'everyday romantic texts', 'love message of the day', 'daily romantic quotes'],
  },
  {
    slug: 'romantic-messages-long-distance',
    title: 'Romantic Messages for Long Distance | LDR Love Texts',
    description: 'Stay connected with romantic messages for long distance relationships. Bridge the miles with love.',
    h1: 'Romantic Messages for Long Distance Relationships',
    timeOfDay: 'both',
    target: 'neutral',
    keywords: ['long distance messages', 'LDR texts', 'romantic long distance', 'love across miles'],
  },
  {
    slug: 'anniversary-love-messages',
    title: 'Anniversary Love Messages | Special Day Texts',
    description: 'Beautiful anniversary love messages. Make your special day even more memorable.',
    h1: 'Anniversary Love Messages',
    timeOfDay: 'both',
    target: 'neutral',
    keywords: ['anniversary messages', 'anniversary texts', 'special day love', 'anniversary quotes'],
  },

  // Time-Specific General
  {
    slug: 'morning-love-quotes',
    title: 'Morning Love Quotes | Start the Day with Love',
    description: 'Beautiful morning love quotes to start your day. Share the warmth with your partner.',
    h1: 'Morning Love Quotes',
    timeOfDay: 'morning',
    target: 'neutral',
    keywords: ['morning love quotes', 'good morning love', 'morning romantic quotes', 'love quotes morning'],
  },
  {
    slug: 'goodnight-love-quotes',
    title: 'Goodnight Love Quotes | End the Day with Love',
    description: 'Sweet goodnight love quotes to end the day. Send your partner to sleep with love.',
    h1: 'Goodnight Love Quotes',
    timeOfDay: 'night',
    target: 'neutral',
    keywords: ['goodnight love quotes', 'night love quotes', 'sweet dreams quotes', 'bedtime love quotes'],
  },

  // Affirmation Categories
  {
    slug: 'words-of-affirmation-her',
    title: 'Words of Affirmation for Her | Compliments for Girlfriend',
    description: 'Beautiful words of affirmation for her. Make your girlfriend or wife feel cherished.',
    h1: 'Words of Affirmation for Her',
    timeOfDay: 'both',
    target: 'feminine',
    keywords: ['words of affirmation her', 'compliments girlfriend', 'affirming words wife', 'love language texts'],
  },
  {
    slug: 'words-of-affirmation-him',
    title: 'Words of Affirmation for Him | Compliments for Boyfriend',
    description: 'Meaningful words of affirmation for him. Make your boyfriend or husband feel valued.',
    h1: 'Words of Affirmation for Him',
    timeOfDay: 'both',
    target: 'masculine',
    keywords: ['words of affirmation him', 'compliments boyfriend', 'affirming words husband', 'love language texts him'],
  },

  // Situational
  {
    slug: 'thinking-of-you-messages',
    title: 'Thinking of You Messages | Sweet Random Texts',
    description: 'Let them know you\'re thinking of them. Sweet surprise messages for any moment.',
    h1: 'Thinking of You Messages',
    timeOfDay: 'both',
    target: 'neutral',
    keywords: ['thinking of you texts', 'random love messages', 'surprise texts partner', 'miss you messages'],
  },
  {
    slug: 'i-love-you-texts',
    title: 'I Love You Texts | Creative Ways to Say I Love You',
    description: 'Creative ways to say I love you. Fresh messages that express your love beautifully.',
    h1: 'I Love You Texts',
    timeOfDay: 'both',
    target: 'neutral',
    keywords: ['i love you texts', 'ways to say i love you', 'love you messages', 'expressing love texts'],
  },

  // Seasonal/Special
  {
    slug: 'valentines-day-messages',
    title: "Valentine's Day Messages | Romantic Love Texts",
    description: "Perfect Valentine's Day messages for your love. Make February 14th unforgettable.",
    h1: "Valentine's Day Messages",
    timeOfDay: 'both',
    target: 'neutral',
    keywords: ['valentines day messages', 'valentines texts', 'february 14 love', 'romantic valentines'],
  },

  // New relationship
  {
    slug: 'new-relationship-texts',
    title: 'New Relationship Texts | Early Dating Messages',
    description: 'Perfect texts for a new relationship. Navigate early dating with the right words.',
    h1: 'New Relationship Texts',
    timeOfDay: 'both',
    target: 'neutral',
    keywords: ['new relationship texts', 'early dating messages', 'new couple texts', 'dating texts'],
  },

  // Apology/Make up
  {
    slug: 'apology-love-messages',
    title: 'Apology Love Messages | Make Up Texts for Partner',
    description: 'Heartfelt apology messages for your partner. Mend things with the right words.',
    h1: 'Apology Love Messages',
    timeOfDay: 'both',
    target: 'neutral',
    keywords: ['apology texts partner', 'sorry messages love', 'make up texts', 'relationship apology'],
  },

  // Appreciation
  {
    slug: 'appreciation-messages-partner',
    title: 'Appreciation Messages for Partner | Thank You Texts',
    description: "Show gratitude with appreciation messages. Let your partner know they're valued.",
    h1: 'Appreciation Messages for Your Partner',
    timeOfDay: 'both',
    target: 'neutral',
    keywords: ['appreciation texts partner', 'thank you love messages', 'grateful partner texts', 'appreciation love'],
  },

  // Flirty
  {
    slug: 'flirty-texts-her',
    title: 'Flirty Texts for Her | Cute Flirty Messages Girlfriend',
    description: 'Playful flirty texts for her. Keep the spark alive with cute flirty messages.',
    h1: 'Flirty Texts for Her',
    timeOfDay: 'both',
    target: 'feminine',
    keywords: ['flirty texts her', 'flirty messages girlfriend', 'cute flirty texts', 'playful texts her'],
  },
  {
    slug: 'flirty-texts-him',
    title: 'Flirty Texts for Him | Cute Flirty Messages Boyfriend',
    description: 'Fun flirty texts for him. Keep things exciting with playful messages.',
    h1: 'Flirty Texts for Him',
    timeOfDay: 'both',
    target: 'masculine',
    keywords: ['flirty texts him', 'flirty messages boyfriend', 'cute flirty texts him', 'playful texts him'],
  },

  // Missing you
  {
    slug: 'miss-you-messages-her',
    title: 'Miss You Messages for Her | Missing Girlfriend Texts',
    description: 'Let her know you miss her. Sweet messages when you wish she was there.',
    h1: 'Miss You Messages for Her',
    timeOfDay: 'both',
    target: 'feminine',
    keywords: ['miss you texts her', 'missing girlfriend messages', 'wish you were here', 'miss her texts'],
  },
  {
    slug: 'miss-you-messages-him',
    title: 'Miss You Messages for Him | Missing Boyfriend Texts',
    description: 'Let him know you miss him. Heartfelt messages when you wish he was there.',
    h1: 'Miss You Messages for Him',
    timeOfDay: 'both',
    target: 'masculine',
    keywords: ['miss you texts him', 'missing boyfriend messages', 'wish you were here him', 'miss him texts'],
  },

  // Encouragement
  {
    slug: 'encouraging-messages-partner',
    title: 'Encouraging Messages for Partner | Support Texts',
    description: 'Be their biggest cheerleader. Encouraging messages to support your partner.',
    h1: 'Encouraging Messages for Your Partner',
    timeOfDay: 'both',
    target: 'neutral',
    keywords: ['encouraging texts partner', 'support messages love', 'motivational texts partner', 'cheer up texts'],
  },

  // Compliments
  {
    slug: 'compliments-for-girlfriend',
    title: 'Compliments for Girlfriend | Sweet Things to Say',
    description: 'Beautiful compliments for your girlfriend. Make her feel special every day.',
    h1: 'Compliments for Your Girlfriend',
    timeOfDay: 'both',
    target: 'feminine',
    keywords: ['compliments girlfriend', 'sweet things to say her', 'girlfriend compliments', 'nice things to say girlfriend'],
  },
  {
    slug: 'compliments-for-boyfriend',
    title: 'Compliments for Boyfriend | Sweet Things to Say',
    description: 'Meaningful compliments for your boyfriend. Make him feel appreciated.',
    h1: 'Compliments for Your Boyfriend',
    timeOfDay: 'both',
    target: 'masculine',
    keywords: ['compliments boyfriend', 'sweet things to say him', 'boyfriend compliments', 'nice things to say boyfriend'],
  },

  // Deep/Meaningful
  {
    slug: 'deep-love-messages',
    title: 'Deep Love Messages | Meaningful Romantic Texts',
    description: 'Express deep love with meaningful messages. Words that touch the heart.',
    h1: 'Deep Love Messages',
    timeOfDay: 'both',
    target: 'neutral',
    vibe: 'poetic',
    keywords: ['deep love messages', 'meaningful love texts', 'profound love quotes', 'heartfelt messages'],
  },

  // Cute
  {
    slug: 'cute-love-messages',
    title: 'Cute Love Messages | Adorable Texts for Partner',
    description: 'Adorable cute love messages. Make your partner smile with sweetness.',
    h1: 'Cute Love Messages',
    timeOfDay: 'both',
    target: 'neutral',
    vibe: 'playful',
    keywords: ['cute love messages', 'adorable texts', 'sweet cute messages', 'lovey dovey texts'],
  },

  // First thing in morning / Last thing at night
  {
    slug: 'first-text-of-the-day',
    title: 'First Text of the Day | Wake Up Messages Partner',
    description: 'Be the first thing they see. Perfect wake up messages for your partner.',
    h1: 'First Text of the Day',
    timeOfDay: 'morning',
    target: 'neutral',
    keywords: ['first text morning', 'wake up messages', 'morning first text', 'start day text'],
  },
  {
    slug: 'last-text-of-the-night',
    title: 'Last Text of the Night | Bedtime Messages Partner',
    description: 'Be the last thing on their mind. Perfect bedtime messages.',
    h1: 'Last Text of the Night',
    timeOfDay: 'night',
    target: 'neutral',
    keywords: ['last text night', 'bedtime messages', 'night last text', 'end day text'],
  },
];

export function getCategoryBySlug(slug: string): SEOCategory | undefined {
  return SEO_CATEGORIES.find(cat => cat.slug === slug);
}

export function getAllCategorySlugs(): string[] {
  return SEO_CATEGORIES.map(cat => cat.slug);
}
