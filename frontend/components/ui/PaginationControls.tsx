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
    <nav className="pagination-shell" aria-label="Pagination">
      <p>
        Page <strong>{currentPage}</strong> of <strong>{lastPage}</strong>
      </p>

      <div className="pagination-actions">
        <button
          type="button"
          disabled={!canGoPrevious}
          onClick={onPrevious}
          className="pagination-button"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={!canGoNext}
          onClick={onNext}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
