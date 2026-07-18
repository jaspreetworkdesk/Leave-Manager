type FormTextareaProps = {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
};

export default function FormTextarea({
  label,
  value,
  placeholder,
  error,
  onChange,
}: FormTextareaProps) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>

      <textarea
        className="w-full border p-3 rounded"
        value={value}
        placeholder={placeholder}
        rows={4}
        onChange={(e) => onChange(e.target.value)}
      />

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}