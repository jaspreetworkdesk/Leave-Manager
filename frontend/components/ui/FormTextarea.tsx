type FormTextareaProps = {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  onChange: (value: string) => void;
};

export default function FormTextarea({
  label,
  value,
  placeholder,
  error,
  rows = 4,
  disabled = false,
  required = false,
  name,
  onChange,
}: FormTextareaProps) {
  const textareaId =
    name ||
    `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  const errorId = `${textareaId}-error`;

  return (
    <div className="form-control-group">
      {label && (
        <label htmlFor={textareaId} className="form-control-label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        name={name}
        className={`form-control ${error ? "has-error" : ""}`}
        value={value}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
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
