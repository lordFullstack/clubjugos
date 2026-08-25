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
        className="mb-1.5 block text-sm font-bold text-ink-700"
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
        className="w-full rounded-2xl border-2 border-ink-900/[0.06] bg-white px-4 py-3.5 text-base text-ink-900 shadow-card outline-none transition placeholder:text-ink-500/50 focus:border-citrus-400"
      />
      {error && (
        <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
