import { AcademyCoursesPage } from "@/components/academy/AcademyCoursesPage";

export const dynamic = "force-dynamic";

/** Liste des cours Academy — route courte `/academy` (locale par défaut dans le layout `(public)`). */
export default function AcademyListPage() {
  return <AcademyCoursesPage />;
}
