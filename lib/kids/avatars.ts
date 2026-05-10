export const KIDS_AVATARS = [
  { id: "lion", emoji: "🦁" },
  { id: "bear", emoji: "🐻" },
  { id: "rabbit", emoji: "🐰" },
  { id: "fox", emoji: "🦊" },
  { id: "star", emoji: "⭐" },
  { id: "rainbow", emoji: "🌈" },
  { id: "balloon", emoji: "🎈" },
  { id: "butterfly", emoji: "🦋" },
] as const;

export type KidsAvatarId = (typeof KIDS_AVATARS)[number]["id"];

export const KIDS_AVATAR_IDS: KidsAvatarId[] = KIDS_AVATARS.map((a) => a.id);

export function isKidsAvatarId(id: string): id is KidsAvatarId {
  return (KIDS_AVATAR_IDS as readonly string[]).includes(id);
}
