export interface IPaginationOptions {
  limit: number;
  page: number;
  search?: string;
  sort?: string;
  disablePagination?: string;
}

export interface IPaginationResponse<T> {
  data: T;
  pagination: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}
