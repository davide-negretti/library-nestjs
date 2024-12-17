export interface PaginatedResponse<T> {
  data: Array<T>;
  startFrom: number;
  pageSize: number;
  lastPage?: boolean;
}
