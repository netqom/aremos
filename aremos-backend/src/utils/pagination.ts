/**
 * Pagination utility for consistent pagination across controllers
 */

export interface PaginationParams {
  page?: string | number;
  pageSize?: string | number;
}

export interface PaginationResult {
  page: number;
  pageSize: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Parse and validate pagination parameters from request query
 * @param query Request query object containing page and pageSize
 * @param defaultPageSize Default page size (default: 20)
 * @param maxPageSize Maximum allowed page size (default: 100)
 * @returns Validated pagination parameters with skip offset
 */
export function parsePagination(
  query: PaginationParams,
  defaultPageSize: number = 20,
  maxPageSize: number = 100
): PaginationResult {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const pageSize = Math.min(
    maxPageSize, 
    Math.max(1, parseInt(String(query.pageSize || String(defaultPageSize)), 10))
  );
  const skip = (page - 1) * pageSize;

  return { page, pageSize, skip };
}

/**
 * Build paginated response object
 */
export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  pagination: PaginationResult
): PaginatedResponse<T> {
  return {
    items,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize
  };
}

