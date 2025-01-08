export interface PaginatedResponse<T> {
  data: Array<T>;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}
