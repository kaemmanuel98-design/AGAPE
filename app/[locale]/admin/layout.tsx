import type { ReactNode } from "react";

/** La sécurité (super-admin) est appliquée dans middleware.ts */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
