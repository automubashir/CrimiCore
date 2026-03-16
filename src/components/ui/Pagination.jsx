const chevRight = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default function Pagination({ currentPage, hasMore, totalPages, onPageChange }) {
  // Numbered pagination when totalPages is known
  if (totalPages != null) {
    if (totalPages <= 1) return null;

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

    return (
      <div className="pagination">
        <button className="pagination-btn" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Previous</button>
        {startPage > 1 && (
          <>
            <button className="pagination-btn" onClick={() => onPageChange(1)}>1</button>
            {startPage > 2 && <span className="pagination-btn" style={{ cursor: 'default' }}>...</span>}
          </>
        )}
        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(p => (
          <button key={p} className={`pagination-btn ${p === currentPage ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="pagination-btn" style={{ cursor: 'default' }}>...</span>}
            <button className="pagination-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
          </>
        )}
        <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button>
      </div>
    );
  }

  // Simple prev/next pagination (server-side, hasMore mode)
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
