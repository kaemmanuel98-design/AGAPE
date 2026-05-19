import { redirect } from "next/navigation";

/** Ancienne URL localisée → page autonome `/join` (évite 404 client dans le layout `[locale]`). */
export default function RejoindreLocaleRedirectPage() {
  redirect("/join");
}
