type FormInputProps = {
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
};

export default function FormInput({
  label,
  type = "text",
  value,
  placeholder,
  error,
  onChange,
}: FormInputProps) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>

      <input
        type={type}
        className="w-full border p-3 rounded"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />

      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}