// Default brand rules sent to Gemini's Brand Guardian check.
// Edit these to match your organisation's brand guidelines.
export interface BrandRules {
  brandName: string;
  /** Correct spellings of names/terms that must appear exactly like this. */
  requiredSpellings: string[];
  /** Words or phrases that must never appear in captions or artwork. */
  bannedWords: string[];
  /** Expected voice & tone. */
  tone: string;
  /** Call-to-action that every post must include (in caption or artwork). */
  requiredCTA: string;
  /** Extra free-form rules. */
  extraRules: string[];
}

export const DEFAULT_BRAND_RULES: BrandRules = {
  brandName: 'Lumbung Studio',
  requiredSpellings: ['Lumbung Studio', 'Gaskeun', 'UI/UX'],
  bannedWords: ['guaranteed', 'cheap', 'murah banget', '100% pasti', 'gratis selamanya'],
  tone: 'Friendly, confident and professional; inclusive; no slang that could be offensive; no exaggerated claims.',
  requiredCTA: 'Apply now / Daftar sekarang (or an equivalent clear call to action with a link-in-bio reference)',
  extraRules: [
    'Hashtags: maximum 8 on Instagram, 5 on LinkedIn, 6 on TikTok.',
    'Do not include personal phone numbers or private emails.',
    'Placeholders like [CITY] or [DEADLINE] must be replaced before publishing.',
  ],
};
