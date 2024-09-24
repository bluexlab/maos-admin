"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

const pagenationItems = ({
  totalPages,
  currentPage,
}: {
  totalPages: number;
  currentPage: number;
}) => {
  const boundaryCount = 1;
  const siblingCount = 1;

  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(Math.max(totalPages - boundaryCount + 1, boundaryCount + 1), totalPages);

  const siblingsStart = Math.max(
    Math.min(
      // Natural start
      currentPage - siblingCount,
      // Lower boundary when page is high
      totalPages - boundaryCount - siblingCount * 2 - 1,
    ),
    // Greater than startPages
    boundaryCount + 2,
  );

  const siblingsEnd = Math.min(
    Math.max(
      // Natural end
      currentPage + siblingCount,
      // Upper boundary when page is low
      boundaryCount + siblingCount * 2 + 2,
    ),
    // Less than endPages
    endPages.length > 0 ? (endPages[0] ?? 0) - 2 : totalPages - 1,
  );

  // Basic list of items to render
  // e.g. itemList = ['first', 'previous', 1, 'ellipsis', 4, 5, 6, 'ellipsis', 10, 'next', 'last']
  return [
    // ...(showFirstButton ? ['first'] : []),
    "previous",
    ...startPages,

    // Start ellipsis
    // eslint-disable-next-line no-nested-ternary
    ...(siblingsStart > boundaryCount + 2
      ? ["start-ellipsis"]
      : boundaryCount + 1 < totalPages - boundaryCount
        ? [boundaryCount + 1]
        : []),

    // Sibling pages
    ...range(siblingsStart, siblingsEnd),

    // End ellipsis
    // eslint-disable-next-line no-nested-ternary
    ...(siblingsEnd < totalPages - boundaryCount - 1
      ? ["end-ellipsis"]
      : totalPages - boundaryCount > boundaryCount
        ? [totalPages - boundaryCount]
        : []),

    ...endPages,
    "next",
    // ...(showLastButton ? ['last'] : []),
  ];
};

const PageItem = ({
  page,
  currentPage,
  pageUrl,
}: {
  page: number | string;
  currentPage: number;
  pageUrl: (page: number) => string;
}) => (
  <PaginationItem>
    {page === "previous" && <PaginationPrevious href={pageUrl(currentPage - 1)} />}
    {page === "next" && <PaginationNext href={pageUrl(currentPage + 1)} />}
    {page === "start-ellipsis" || (page === "end-ellipsis" && <PaginationEllipsis />)}
    {typeof page === "number" && (
      <PaginationLink
        isActive={page === currentPage}
        href={pageUrl(page)}
        className={
          page === currentPage ? "bg-gray-300 text-black hover:bg-gray-300 hover:text-black" : ""
        }
      >
        {page}
      </PaginationLink>
    )}
  </PaginationItem>
);

const Paginator = ({
  totalPages,
  currentPage,
  pageUrl,
}: {
  totalPages: number;
  currentPage: number;
  pageUrl: (page: number) => string;
}) => {
  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        {pagenationItems({ totalPages, currentPage }).map((page) => (
          <PageItem key={page} page={page} currentPage={currentPage} pageUrl={pageUrl} />
        ))}
      </PaginationContent>
    </Pagination>
  );
};

export default Paginator;
