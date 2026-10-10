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
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className="w-full rounded-2xl border-2 border-ink-900/[0.06] bg-white px-4 py-3.5 text-base text-ink-900 shadow-card outline-none transition placeholder:text-ink-500/60 focus:border-citrus-600 focus:ring-4 focus:ring-citrus-200/70"
      />
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
