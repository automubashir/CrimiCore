const chevRight = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default function Pagination({ currentPage, hasMore, onPageChange }) {
  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      <button className="pagination-btn active">{currentPage}</button>
      {hasMore && (
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next {chevRight}
        </button>
      )}
    </div>
  );
}
