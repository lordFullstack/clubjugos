type FieldProps = {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  error?: string;
};

export function FormField({
  label,
  name,
  type,
  autoComplete,
  placeholder,
  error,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-ink-700"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3.5 text-base text-ink-900 shadow-card outline-none ring-brand-400 placeholder:text-ink-500/50 focus:ring-2"
      />
      {error && (
        <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
