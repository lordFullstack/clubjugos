import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/services/auth-service";

// NOTA: esta pantalla es un placeholder temporal solo para validar
// el flujo de autenticación de la Fase 2. El dashboard real del cliente
// (colección, progreso, premio, botón escanear) se construye en la Fase 4.
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = (user.user_metadata?.name as string | undefined) ?? "amigo";
  const firstName = name.split(" ")[0];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50 px-6 text-center">
      <div className="text-5xl" role="img" aria-label="Vaso de jugo">
        🥤
      </div>
      <h1 className="font-display text-2xl font-extrabold text-ink-900">
        Hola, {firstName} 👋
      </h1>
      <p className="max-w-xs text-ink-500">
        Tu sesión funciona correctamente. El dashboard con tu colección de
        stickers llega en la próxima fase.
      </p>
      <form action={logout}>
        <button
          type="submit"
          className="mt-4 rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-ink-700 shadow-card active:scale-[0.98]"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
