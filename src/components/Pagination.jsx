
function Pagination({ currentPage, totalPages, setCurrentPage }) {
  return (
    <div className="pagination">
      <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>最初</button>
      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>前</button>
      <span style={{ margin: "0 1em" }}>{currentPage} / {totalPages} ページ</span>
      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>次</button>
      <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>最後</button>
    </div>
  );
}

export default Pagination;
