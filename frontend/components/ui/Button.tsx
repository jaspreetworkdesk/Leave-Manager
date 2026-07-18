type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export default function Button({
  children,
  type = "button",
  loading = false,
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className="bg-blue-600 text-white px-5 py-3 rounded disabled:opacity-60"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}