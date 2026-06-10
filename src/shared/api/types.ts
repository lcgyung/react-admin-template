export interface ApiErrorResponse {
  message: string;
  code?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
