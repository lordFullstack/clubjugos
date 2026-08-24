import { QrGeneratorForm } from "@/components/admin/qr-generator-form";

export default function AdminQrPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink-900">
        Generar QR
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Cada código es de un solo uso, criptográficamente aleatorio, y expira
        automáticamente.
      </p>
      <QrGeneratorForm />
    </div>
  );
}
