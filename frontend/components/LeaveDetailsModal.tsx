export default function LeaveDetailsModal({
  leave,
  onClose,
}: {
  leave: any;
  onClose: () => void;
}) {

  if (!leave) return null;

  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

      <div className="bg-white p-6 rounded w-[500px]">

        <h2 className="text-2xl font-bold mb-4">
          Leave Details
        </h2>

        <p>
          Employee: {leave.user?.name}
        </p>

        <p>
          Leave Type: {leave.leave_type}
        </p>

        <p>
          Start Date: {leave.start_date}
        </p>

        <p>
          End Date: {leave.end_date}
        </p>

        <p>
          Reason: {leave.reason}
        </p>

        <p>
          Status: {leave.status}
        </p>

        <button
          onClick={onClose}
          className="mt-5 bg-red-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>

      </div>

    </div>

  );
}