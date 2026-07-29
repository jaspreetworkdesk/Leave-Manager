type FormInputProps = {
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  autoComplete?: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
};

export default function FormInput({
  label,
  type = "text",
  value,
  placeholder,
  error,
  disabled = false,
  readOnly = false,
  required = false,
  name,
  autoComplete,
  min,
  max,
  onChange,
}: FormInputProps) {
  const inputId =
    name ||
    `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="form-control-group">
      {label && (
        <label htmlFor={inputId} className="form-control-label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        className={`form-control ${error ? "has-error" : ""}`}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoComplete={autoComplete}
        min={min}
        max={max}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />

      {error && (
        <p id={errorId} className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
