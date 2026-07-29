type Option = {
  label: string;
  value: string;
};

type FormSelectProps = {
  label: string;
  value: string;
  error?: string;
  options: Option[];
  disabled?: boolean;
  required?: boolean;
  name?: string;
  onChange: (value: string) => void;
};

export default function FormSelect({
  label,
  value,
  error,
  options,
  disabled = false,
  required = false,
  name,
  onChange,
}: FormSelectProps) {
  const selectId =
    name ||
    `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  const errorId = `${selectId}-error`;

  return (
    <div className="form-control-group">
      {label && (
        <label htmlFor={selectId} className="form-control-label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        className={`form-control ${error ? "has-error" : ""}`}
        value={value}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={errorId} className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
