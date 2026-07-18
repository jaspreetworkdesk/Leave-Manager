type Option = {
  label: string;
  value: string;
};

type FormSelectProps = {
  label: string;
  value: string;
  error?: string;
  options: Option[];
  onChange: (value: string) => void;
};

export default function FormSelect({
  label,
  value,
  error,
  options,
  onChange,
}: FormSelectProps) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>

      <select
        className="w-full border p-3 rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}