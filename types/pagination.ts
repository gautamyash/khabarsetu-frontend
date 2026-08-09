/** Generic paginated response shape, mirrors the backend's Page[T] schema. */
export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
