type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id || props.name || "input-field";
  const errorId = `${inputId}-error`;

  return (
    <div className="form-control-group">
      {label && (
        <label htmlFor={inputId} className="form-control-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`form-control ${error ? "has-error" : ""} ${className}`.trim()}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : props["aria-describedby"]}
        {...props}
      />
      {error && (
        <p id={errorId} className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
