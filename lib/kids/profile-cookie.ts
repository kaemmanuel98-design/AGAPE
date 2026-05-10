import { isKidsAvatarId } from "@/lib/kids/avatars";
import type { KidProfile } from "@/lib/kids/types";

export const KIDS_PROFILE_COOKIE = "kids_profile";

export function parseKidProfileJson(raw: string | undefined): KidProfile | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return null;
    const firstName = "firstName" in o && typeof o.firstName === "string" ? o.firstName.trim().slice(0, 40) : "";
    const avatarId =
      "avatarId" in o && typeof o.avatarId === "string" ? o.avatarId : "";
    if (!firstName || !isKidsAvatarId(avatarId)) {
      return null;
    }
    return { firstName, avatarId };
  } catch {
    return null;
  }
}
