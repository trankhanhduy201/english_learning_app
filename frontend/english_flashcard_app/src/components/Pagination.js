import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Pagination = ({ current_page, total_pages, onPageChange }) => {
  const handlePrevious = () => {
    if (current_page > 1) {
      onPageChange(current_page - 1);
    }
  };

  const handleNext = () => {
    if (current_page < total_pages) {
      onPageChange(current_page + 1);
    }
  };

  const handlePageClick = (page) => {
    if (page !== current_page) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= total_pages; i++) {
      pages.push(
        <li
          key={i}
          className={`page-item ${i == current_page ? "active" : ""}`}
        >
          <button
            className="page-link"
            onClick={() => handlePageClick(i)}
          >
            {i}
          </button>
        </li>
      );
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info mb-3">
        <ul className="pagination">
          <li className={`page-item ${current_page == 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={handlePrevious}
              disabled={current_page == 1}
            >
              « Pre
            </button>
          </li>
          {renderPageNumbers()}
          <li
            className={`page-item ${
              current_page == total_pages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={handleNext}
              disabled={current_page == total_pages}
            >
              Next »
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Pagination;