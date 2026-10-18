/**
 * Real Gemini integration via Firebase AI Logic (Gemini Developer API backend).
 * All AI calls in the app go through this module.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  Schema,
  type GenerativeModel,
} from 'firebase/ai';
import type { PlatformName } from '../types';
import { DEFAULT_BRAND_RULES, type BrandRules } from '../config/brandRules';

export const GEMINI_MODEL = 'gemini-2.5-flash';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
};

/** True when the minimum Firebase config needed for AI Logic is present. */
export const isAIConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

export class AINotConfiguredError extends Error {
  constructor() {
    super(
      'AI not configured: set VITE_FIREBASE_* variables in .env (see .env.example) and rebuild.'
    );
    this.name = 'AINotConfiguredError';
  }
}

let app: FirebaseApp | null = null;
const models: Record<string, GenerativeModel> = {};

function getModel(key: string, responseSchema: Schema): GenerativeModel {
  if (!isAIConfigured) throw new AINotConfiguredError();
  if (!app) app = initializeApp(firebaseConfig);
  if (!models[key]) {
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    models[key] = getGenerativeModel(ai, {
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.8,
      },
    });
  }
  return models[key];
}

// ---------- Image helpers ----------

export interface UploadedImage {
  name: string;
  size: number;
  mimeType: string;
  base64: string; // raw base64, no data: prefix
  previewUrl: string; // data URL for <img>
  width?: number;
  height?: number;
}

export const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export async function readImageFile(file: File): Promise<UploadedImage> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (PNG, JPG, WEBP).');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Image is larger than 15 MB.');
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const dims = await new Promise<{ width?: number; height?: number }>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({});
    img.src = dataUrl;
  });
  return { name: file.name, size: file.size, mimeType: file.type, base64, previewUrl: dataUrl, ...dims };
}

const imagePart = (img: UploadedImage) => ({
  type: 'inlineData' as const,
  inlineData: { mimeType: img.mimeType, data: img.base64 },
});

function parseJSON<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error('Gemini returned an invalid JSON response.');
  }
}

function brandRulesText(rules: BrandRules): string {
  return [
    `Brand name (exact spelling): ${rules.brandName}`,
    `Required spellings: ${rules.requiredSpellings.join(', ')}`,
    `Banned words/phrases: ${rules.bannedWords.join(', ')}`,
    `Tone: ${rules.tone}`,
    `Required CTA: ${rules.requiredCTA}`,
    ...rules.extraRules.map((r) => `Rule: ${r}`),
  ].join('\n');
}

// ---------- Caption generation ----------

export interface GeneratedPlatformCaption {
  title: string;
  caption: string;
  hashtags: string[];
  tone: string;
}

export interface CaptionResult {
  detected: {
    contentType: string;
    summary: string;
    keyFields: { label: string; value: string }[];
  };
  platforms: Record<PlatformName, GeneratedPlatformCaption>;
}

const platformCaptionSchema = (desc: string) =>
  Schema.object({
    description: desc,
    properties: {
      title: Schema.string({ description: 'Short internal post title (max 60 chars)' }),
      caption: Schema.string({ description: 'Ready-to-post caption text, without hashtags' }),
      hashtags: Schema.array({
        items: Schema.string({ description: 'Hashtag starting with #' }),
      }),
      tone: Schema.string({ description: '2-4 word tone label, e.g. "Warm & energetic"' }),
    },
  });

const captionSchema = Schema.object({
  properties: {
    detected: Schema.object({
      properties: {
        contentType: Schema.string({ description: 'What the artwork is, e.g. "Hiring poster"' }),
        summary: Schema.string({ description: 'One-sentence description of the artwork' }),
        keyFields: Schema.array({
          description: 'Up to 4 key facts extracted from the artwork (OCR/layout)',
          items: Schema.object({
            properties: { label: Schema.string(), value: Schema.string() },
          }),
        }),
      },
    }),
    Instagram: platformCaptionSchema('Instagram feed caption, max 2200 chars, 5-8 hashtags'),
    LinkedIn: platformCaptionSchema('LinkedIn company page caption, professional, max 3000 chars, 3-5 hashtags'),
    TikTok: platformCaptionSchema('TikTok caption, punchy, max 2200 chars, 3-6 hashtags'),
  },
});

export async function generateCaptions(
  image: UploadedImage,
  opts: { rules?: BrandRules; previous?: string[] } = {}
): Promise<CaptionResult> {
  const rules = opts.rules ?? DEFAULT_BRAND_RULES;
  const model = getModel('captions', captionSchema);
  const prompt = [
    `You are the social media copywriter for ${rules.brandName}.`,
    'Analyse the attached artwork (read any text on it) and write platform-specific captions for Instagram, LinkedIn and TikTok, plus hashtags.',
    'Write in the language used on the artwork (Indonesian or English). Follow these brand rules:',
    brandRulesText(rules),
    'If the artwork contains placeholders like [CITY] keep them as-is. Do not invent facts that are not in the artwork.',
    opts.previous?.length
      ? `Write a fresh variation that is clearly different from these previous captions:\n${opts.previous.join('\n---\n')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const result = await model.generateContent([prompt, imagePart(image)]);
  const raw = parseJSON<{
    detected: CaptionResult['detected'];
    Instagram: GeneratedPlatformCaption;
    LinkedIn: GeneratedPlatformCaption;
    TikTok: GeneratedPlatformCaption;
  }>(result.response.text());
  const norm = (p: GeneratedPlatformCaption): GeneratedPlatformCaption => ({
    title: p?.title ?? '',
    caption: p?.caption ?? '',
    tone: p?.tone ?? '',
    hashtags: (p?.hashtags ?? []).map((h) => (h.startsWith('#') ? h : `#${h}`).replace(/\s+/g, '')),
  });
  return {
    detected: {
      contentType: raw.detected?.contentType ?? 'Artwork',
      summary: raw.detected?.summary ?? '',
      keyFields: (raw.detected?.keyFields ?? []).slice(0, 4),
    },
    platforms: {
      Instagram: norm(raw.Instagram),
      LinkedIn: norm(raw.LinkedIn),
      TikTok: norm(raw.TikTok),
    },
  };
}

// ---------- Brand Guardian ----------

export type IssueSeverity = 'low' | 'medium' | 'high';

export interface BrandIssue {
  type: string;
  text: string;
  suggestion: string;
  severity: IssueSeverity;
}

export interface BrandCheckResult {
  issues: BrandIssue[];
  riskScore: number; // 0-100
  summary: string;
  checkedAt: string; // ISO timestamp
  model: string;
}

const brandSchema = Schema.object({
  properties: {
    issues: Schema.array({
      items: Schema.object({
        properties: {
          type: Schema.enumString({
            enum: ['spelling', 'banned_word', 'tone', 'cta', 'brand_name', 'placeholder', 'visual', 'hashtags', 'other'],
          }),
          text: Schema.string({ description: 'The problem found, quoting the offending text if any' }),
          suggestion: Schema.string({ description: 'Concrete fix' }),
          severity: Schema.enumString({ enum: ['low', 'medium', 'high'] }),
        },
      }),
    }),
    riskScore: Schema.integer({ description: '0 (safe) to 100 (must not publish)' }),
    summary: Schema.string({ description: 'One or two sentence overall verdict for the reviewer' }),
  },
});

export async function checkBrand(
  image: UploadedImage | null,
  captions: Partial<Record<PlatformName, string>>,
  rules: BrandRules = DEFAULT_BRAND_RULES
): Promise<BrandCheckResult> {
  const model = getModel('brand', brandSchema);
  const captionText = Object.entries(captions)
    .filter(([, c]) => c && c.trim())
    .map(([p, c]) => `[${p}]\n${c}`)
    .join('\n\n');
  const prompt = [
    `You are "Brand Guardian", a strict brand-compliance reviewer for ${rules.brandName}.`,
    'Check the attached artwork (including text in the image) and the captions below against the brand rules.',
    'Report every concrete issue (typos, wrong brand spelling, banned words, off-tone copy, missing CTA, unreplaced placeholders, visual problems). If everything is fine return an empty issues array and a low riskScore.',
    'BRAND RULES:\n' + brandRulesText(rules),
    'CAPTIONS:\n' + (captionText || '(no captions provided)'),
  ].join('\n\n');
  const parts = image ? [prompt, imagePart(image)] : [prompt];
  const result = await model.generateContent(parts);
  const raw = parseJSON<Omit<BrandCheckResult, 'checkedAt' | 'model'>>(result.response.text());
  return {
    issues: (raw.issues ?? []).map((i) => ({
      type: i.type ?? 'other',
      text: i.text ?? '',
      suggestion: i.suggestion ?? '',
      severity: (['low', 'medium', 'high'] as const).includes(i.severity) ? i.severity : 'medium',
    })),
    riskScore: Math.max(0, Math.min(100, Math.round(Number(raw.riskScore) || 0))),
    summary: raw.summary ?? '',
    checkedAt: new Date().toISOString(),
    model: GEMINI_MODEL,
  };
}

export function describeAIError(err: unknown): string {
  if (err instanceof AINotConfiguredError) return err.message;
  const msg = err instanceof Error ? err.message : String(err);
  if (/api-not-enabled|firebasevertexai|firebaseml|AI Logic/i.test(msg))
    return 'Firebase AI Logic is not enabled for this project. Enable it in the Firebase console (Build → AI Logic → Gemini Developer API). Details: ' + msg;
  return 'Gemini request failed: ' + msg;
}
