import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";

export default function PlanningAliasPage() {
  redirect(`/${routing.defaultLocale}/planning`);
}
