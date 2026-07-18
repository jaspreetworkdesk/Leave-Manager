type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  warning?: boolean;
};

export default function StatCard({
  title,
  value,
  description,
  warning = false,
}: StatCardProps) {
  return (
    <div
      className={`border rounded p-5 ${
        warning ? "bg-red-50 border-red-200" : "bg-white"
      }`}
    >
      <p className="text-sm text-gray-500">{title}</p>

      <p
        className={`text-3xl font-bold mt-2 ${
          warning ? "text-red-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>

      {description && (
        <p
          className={`text-sm mt-2 ${
            warning ? "text-red-600" : "text-gray-500"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}