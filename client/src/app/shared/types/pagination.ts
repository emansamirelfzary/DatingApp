export type PaginationMetadata = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
};

export type PaginatedResult<T> = {
  items: T[];
  metadata: PaginationMetadata;
};