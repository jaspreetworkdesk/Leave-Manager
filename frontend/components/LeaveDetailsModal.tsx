export default function LeaveDetailsModal({
  leave,
  onClose,
}: {
  leave: any;
  onClose: () => void;
}) {
  if (!leave) return null;

  const details = [
    ["Employee", leave.user?.name || "-"],
    ["Leave Type", leave.leave_type || "-"],
    ["Start Date", leave.start_date || "-"],
    ["End Date", leave.end_date || "-"],
    ["Status", leave.status || "-"],
  ];

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="leave-details-title">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Request overview
            </p>
            <h2 id="leave-details-title" className="mt-1 text-2xl font-bold">
              Leave Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-xl border bg-white text-gray-600"
            aria-label="Close leave details"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-content">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-gray-50 p-4">
                <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  {label}
                </dt>
                <dd className="mt-1 font-semibold text-gray-900 capitalize">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 rounded-xl border bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Reason
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              {leave.reason || "No reason provided."}
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button type="button" onClick={onClose} className="ui-button">
              Close details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
