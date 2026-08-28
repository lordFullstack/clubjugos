import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/get-admin-session";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getAdminSession();

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  // Un cliente que intenta entrar a /admin se manda de vuelta a su propia
  // app. Nunca se muestra un error técnico de permisos: simplemente no
  // existe esa puerta para él.
  if (result.status === "unauthorized") {
    redirect("/home");
  }

  return (
    <AdminShell role={result.session.role} name={result.session.name}>
      {children}
    </AdminShell>
  );
}
