import { useMemo } from "react";

export type PaginationItem = number | "ellipsis";

type PaginationArgs = {
  currentPage: number;
  totalPages: number;
};

const buildPaginationItems = (
  currentPage: number,
  totalPages: number
): PaginationItem[] => {
  if (!totalPages || totalPages <= 1) {
    return totalPages === 1 ? [1] : [];
  }

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PaginationItem[] = [];
  const showLeftEllipsis = currentPage > 3;
  const showRightEllipsis = currentPage < totalPages - 2;

  items.push(1);

  if (showLeftEllipsis) {
    items.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i += 1) {
    items.push(i);
  }

  if (showRightEllipsis) {
    items.push("ellipsis");
  }

  items.push(totalPages);
  return items;
};

export const usePaginationItems = ({
  currentPage,
  totalPages,
}: PaginationArgs) =>
  useMemo(
    () => buildPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  );
