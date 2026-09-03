'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import classes from './pagination.module.css';

export default function Pagination({ currentPage, totalPages }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingPage, setLoadingPage] = useState(null);

  if (totalPages <= 1) return null;

  const handlePageChange = (page) => {
    setLoadingPage(page);
    startTransition(() => {
      router.push(`/meals?page=${page}`);
    });
  };

  const pages = [];
  const maxVisible = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav className={classes.pagination} aria-label="Pagination">
      {currentPage > 1 && (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className={classes.link}
          disabled={isPending}
        >
          {isPending && loadingPage === currentPage - 1 ? 'Loading...' : '← Previous'}
        </button>
      )}

      <div className={classes.pages}>
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className={classes.pageLink}
              disabled={isPending}
            >
              1
            </button>
            {startPage > 2 && <span className={classes.ellipsis}>...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`${classes.pageLink} ${page === currentPage ? classes.active : ''}`}
            aria-current={page === currentPage ? 'page' : undefined}
            disabled={isPending || page === currentPage}
          >
            {isPending && loadingPage === page ? '...' : page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className={classes.ellipsis}>...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className={classes.pageLink}
              disabled={isPending}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {currentPage < totalPages && (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className={classes.link}
          disabled={isPending}
        >
          {isPending && loadingPage === currentPage + 1 ? 'Loading...' : 'Next →'}
        </button>
      )}
    </nav>
  );
}
