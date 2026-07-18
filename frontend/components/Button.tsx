type ButtonProps = {
  title: string;
  onClick?: () => void;
};

export default function Button({
  title,
  onClick,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-black text-white px-4 py-2 rounded"
    >
      {title}
    </button>
  );
}
