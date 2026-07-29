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
    <article className={`stat-card ${warning ? "is-warning" : ""}`}>
      <p className="stat-card-title">{title}</p>
      <p className="stat-card-value">{value}</p>
      {description && <p className="stat-card-description">{description}</p>}
    </article>
  );
}
