export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_MAX_PAGE_BUTTONS = 10;

/**
 * Build a window of page numbers (e.g., 1-10, 11-20) capped by totalPages.
 */
export const buildPageNumbersWindow = (
  page: number,
  maxPageButtons: number,
  totalPages: number
): number[] => {
  const safeTotal = Math.max(totalPages, 1);
  const windowStart =
    Math.floor((page - 1) / maxPageButtons) * maxPageButtons + 1;
  const windowEnd = Math.min(windowStart + maxPageButtons - 1, safeTotal);

  const pageNumbers: number[] = [];
  for (let p = windowStart; p <= windowEnd; p++) {
    pageNumbers.push(p);
  }
  return pageNumbers;
};

/**
 * Slice items for the current page and derive pagination meta.
 */
export const paginateGroups = <T>(
  items: T[] | undefined,
  page: number,
  pageSize: number
) => {
  const totalGroups = items?.length ?? 0;
  const totalPages = totalGroups > 0 ? Math.ceil(totalGroups / pageSize) : 1;

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageGroups = items
    ? items.slice(startIndex, endIndex)
    : ([] as T[]);

  return { totalGroups, totalPages, startIndex, endIndex, pageGroups };
};

/**
 * Determine if all items on the current page are selected.
 */
export const areAllPageItemsSelected = <T>(
  pageItems: T[],
  selectedKeys: string[],
  buildKey: (item: T) => string
): boolean => {
  if (pageItems.length === 0) return false;
  return pageItems.every((item) => selectedKeys.includes(buildKey(item)));
};
