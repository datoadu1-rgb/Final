import { useSearchParams } from "react-router-dom";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

function Pagination({ page, totalPages, total, limit }: PaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  function changePage(newPage: number) {
    const params = new URLSearchParams(searchParams);

    params.set("page", String(newPage));

    setSearchParams(params);

    // tavshi dabruneba
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (total === 0) {
    return null;
  }

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <p className="pagination__info">
        Showing {from}–{to} of {total}
      </p>

      {totalPages > 1 && (
        <nav className="pagination__nav">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => changePage(page - 1)}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;

            return (
              <button
                key={pageNumber}
                type="button"
                className={pageNumber === page ? "pagination__current" : ""}
                disabled={pageNumber === page}
                onClick={() => changePage(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => changePage(page + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

export default Pagination;
