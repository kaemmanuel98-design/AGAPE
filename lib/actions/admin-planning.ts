"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdmin } from "@/lib/admin/auth";

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function upsertPlanningEntry(formData: FormData) {
  const locale = normalizeText(formData.get("locale")) || "fr";
  const serviceDate = normalizeText(formData.get("service_date"));
  const serviceName = normalizeText(formData.get("service_name")) || "Culte";
  const regie = normalizeText(formData.get("regie")) || null;
  const protocole = normalizeText(formData.get("protocole")) || null;
  const accueil = normalizeText(formData.get("accueil")) || null;
  const louange = normalizeText(formData.get("louange")) || null;
  const predication = normalizeText(formData.get("predication")) || null;

  if (!serviceDate) {
    return { ok: false as const, message: "Choisissez une date pour le culte." };
  }

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  const { error } = await auth.supabase.from("planning").upsert(
    {
      service_date: serviceDate,
      service_name: serviceName,
      regie,
      protocole,
      accueil,
      louange,
      predication,
    },
    { onConflict: "service_date,service_name" },
  );

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath(`/${locale}/planning`, "layout");
  revalidatePath(`/${locale}/admin`, "layout");
  return { ok: true as const };
}

export async function deletePlanningEntry(formData: FormData) {
  const locale = normalizeText(formData.get("locale")) || "fr";
  const id = normalizeText(formData.get("id"));

  if (!id) {
    return { ok: false as const, message: "Entrée de planning introuvable." };
  }

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  const { error } = await auth.supabase.from("planning").delete().eq("id", id);
  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath(`/${locale}/planning`, "layout");
  revalidatePath(`/${locale}/admin`, "layout");
  return { ok: true as const };
}
