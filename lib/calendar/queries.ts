import { createClient } from "@/utils/supabase/server";

import type { PublicMemberBirthdayRow } from "./types";

function getMonthDayParts(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return { year, month, day };
}

function compareByBirthday(a: PublicMemberBirthdayRow, b: PublicMemberBirthdayRow) {
  const aParts = getMonthDayParts(a.birth_date);
  const bParts = getMonthDayParts(b.birth_date);

  if (aParts.month !== bParts.month) {
    return aParts.month - bParts.month;
  }

  if (aParts.day !== bParts.day) {
    return aParts.day - bParts.day;
  }

  return formatBirthdayMemberName(a).localeCompare(formatBirthdayMemberName(b), "fr", {
    sensitivity: "base",
  });
}

export function formatBirthdayMemberName(member: {
  first_names: string | null;
  last_name: string | null;
}) {
  const fullName = [member.first_names, member.last_name].filter(Boolean).join(" ").trim();
  return fullName || "Membre Agape";
}

/**
 * Anniversaires membres (RPC agrégée côté base).
 *
 * --- Appel SQL ---
 * `SELECT * FROM public.list_public_member_birthdays()` (fonction SQL exposée comme `.rpc()`).
 */
export async function listPublicMemberBirthdays() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_public_member_birthdays");

  if (error) {
    console.error("listPublicMemberBirthdays", error);
    return [] as PublicMemberBirthdayRow[];
  }

  return ((data ?? []) as PublicMemberBirthdayRow[]).sort(compareByBirthday);
}

export async function listCurrentMonthBirthdays(referenceDate = new Date()) {
  const currentMonth = referenceDate.getMonth() + 1;
  const birthdays = await listPublicMemberBirthdays();

  return birthdays
    .filter((entry) => getMonthDayParts(entry.birth_date).month === currentMonth)
    .sort(compareByBirthday);
}

export async function listTodayBirthdays(referenceDate = new Date()) {
  const currentMonth = referenceDate.getMonth() + 1;
  const currentDay = referenceDate.getDate();
  const birthdays = await listPublicMemberBirthdays();

  return birthdays
    .filter((entry) => {
      const parts = getMonthDayParts(entry.birth_date);
      return parts.month === currentMonth && parts.day === currentDay;
    })
    .sort(compareByBirthday);
}
