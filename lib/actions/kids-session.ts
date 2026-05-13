"use server";

import { cookies } from "next/headers";

import { redirect } from "@/i18n/navigation";
import { isKidsAvatarId } from "@/lib/kids/avatars";
import { KIDS_PROFILE_COOKIE } from "@/lib/kids/profile-cookie";

export async function saveKidsProfile(formData: FormData) {
  const locale = String(formData.get("locale") ?? "fr").slice(0, 5);
  const firstName = String(formData.get("firstName") ?? "").trim().slice(0, 40);
  const avatarIdRaw = String(formData.get("avatarId") ?? "");

  if (!firstName || !isKidsAvatarId(avatarIdRaw)) {
    redirect({ href: "/kids", locale });
  }

  const avatarId = avatarIdRaw;

  const cookieStore = await cookies();
  cookieStore.set(
    KIDS_PROFILE_COOKIE,
    JSON.stringify({ firstName, avatarId }),
    {
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );

  redirect({ href: "/kids", locale });
}

export async function clearKidsProfile(formData: FormData) {
  const locale = String(formData.get("locale") ?? "fr").slice(0, 5);
  const cookieStore = await cookies();
  cookieStore.delete(KIDS_PROFILE_COOKIE);
  redirect({ href: "/kids", locale });
}
