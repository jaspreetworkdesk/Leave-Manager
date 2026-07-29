type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function Button({
  children,
  type = "button",
  loading = false,
  disabled = false,
  onClick,
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`ui-button ${className}`.trim()}
      aria-busy={loading}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
