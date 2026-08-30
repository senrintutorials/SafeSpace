export type AvatarStyle = 'anime' | 'chibi' | 'chibi_3d' | 'realistic' | 'action_star' | 'movie_star';

export interface AvatarSticker {
  id: string;
  style: AvatarStyle;
  styleName: string;
  dataUrl: string; // High-resolution canvas PNG output
  originalPhotoUrl?: string;
  createdAt: string;
  moodTagline?: string;
  borderStyle?: string;
  bgGradient?: string;
  accessory?: string;
}

const STORAGE_KEY = 'safespace_user_avatar_stickers';
const ACTIVE_AVATAR_KEY = 'safespace_active_avatar_sticker';

// Initial pre-generated demo stickers if local storage is empty
const DEFAULT_DEMO_STICKERS: AvatarSticker[] = [
  {
    id: 'demo-anime-01',
    style: 'anime',
    styleName: 'Anime Heroine',
    dataUrl: createDemoCanvasSticker('Anime Heroine', '#ec4899', '#8b5cf6', '✨ Mindful & Strong'),
    createdAt: new Date().toISOString(),
    moodTagline: '✨ Mindful & Strong',
    borderStyle: 'glowing_neon',
    bgGradient: 'from-pink-500 to-purple-600',
    accessory: 'Sparkle Aura'
  },
  {
    id: 'demo-chibi-01',
    style: 'chibi',
    styleName: 'Kawaii Chibi',
    dataUrl: createDemoCanvasSticker('Kawaii Chibi', '#3b82f6', '#10b981', '🌸 SafeSpace Buddy'),
    createdAt: new Date().toISOString(),
    moodTagline: '🌸 SafeSpace Buddy',
    borderStyle: 'circular_pill',
    bgGradient: 'from-blue-400 to-emerald-400',
    accessory: 'Headset'
  },
  {
    id: 'demo-movie-01',
    style: 'movie_star',
    styleName: 'Hollywood Star',
    dataUrl: createDemoCanvasSticker('Hollywood Star', '#eab308', '#f97316', '⭐ Stardom Glow'),
    createdAt: new Date().toISOString(),
    moodTagline: '⭐ Stardom Glow',
    borderStyle: 'holographic_stamp',
    bgGradient: 'from-amber-400 to-orange-500',
    accessory: 'Golden Crown'
  }
];

function createDemoCanvasSticker(title: string, color1: string, color2: string, tagline: string): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Outer Circle
  ctx.beginPath();
  ctx.arc(120, 120, 110, 0, Math.PI * 2);
  const grad = ctx.createLinearGradient(0, 0, 240, 240);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Face Silhouette / Avatar graphic
  ctx.beginPath();
  ctx.arc(120, 100, 45, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fill();

  // Eyes
  ctx.beginPath();
  ctx.arc(105, 95, 6, 0, Math.PI * 2);
  ctx.arc(135, 95, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#1e293b';
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(120, 108, 12, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#f43f5e';
  ctx.stroke();

  // Tagline banner
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(20, 175, 200, 36, 18);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = color1;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(tagline, 120, 198);

  return canvas.toDataURL('image/png');
}

export function getSavedAvatarStickers(): AvatarSticker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_STICKERS));
      return DEFAULT_DEMO_STICKERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DEMO_STICKERS;
  } catch (e) {
    return DEFAULT_DEMO_STICKERS;
  }
}

export function saveAvatarSticker(sticker: AvatarSticker): AvatarSticker[] {
  try {
    const current = getSavedAvatarStickers();
    const updated = [sticker, ...current.filter(s => s.id !== sticker.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Set as active avatar automatically when created
    setActiveAvatarSticker(sticker);
    return updated;
  } catch (e) {
    return [];
  }
}

export function deleteAvatarSticker(id: string): AvatarSticker[] {
  try {
    const current = getSavedAvatarStickers();
    const updated = current.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const active = getActiveAvatarSticker();
    if (active?.id === id) {
      setActiveAvatarSticker(updated[0] || null);
    }
    return updated;
  } catch (e) {
    return [];
  }
}

export function getActiveAvatarSticker(): AvatarSticker | null {
  try {
    const raw = localStorage.getItem(ACTIVE_AVATAR_KEY);
    if (raw) return JSON.parse(raw);
    const list = getSavedAvatarStickers();
    return list[0] || null;
  } catch (e) {
    return null;
  }
}

export function setActiveAvatarSticker(sticker: AvatarSticker | null): void {
  try {
    if (!sticker) {
      localStorage.removeItem(ACTIVE_AVATAR_KEY);
    } else {
      localStorage.setItem(ACTIVE_AVATAR_KEY, JSON.stringify(sticker));
    }
  } catch (e) {
    // Silent
  }
}
