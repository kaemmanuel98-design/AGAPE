import { AcademyCoursesPage } from "@/components/academy/AcademyCoursesPage";

export const dynamic = "force-dynamic";

/** Liste des cours Academy — données `academy_courses` (Supabase). */
export default function AcademyListPage() {
  return <AcademyCoursesPage />;
}
