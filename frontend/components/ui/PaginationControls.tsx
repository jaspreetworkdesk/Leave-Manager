type PaginationControlsProps = {
  currentPage: number;
  lastPage: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export default function PaginationControls({
  currentPage,
  lastPage,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  if (lastPage <= 1) {
    return null;
  }

  return (
    <div className="flex justify-between items-center border rounded p-4">
      <p className="text-sm text-gray-500">
        Page {currentPage} of {lastPage}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canGoPrevious}
          onClick={onPrevious}
          className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={!canGoNext}
          onClick={onNext}
          className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}