import { CategoryType } from './CategoryType';

export interface Category {
  id: number;
  name: string;
  types: CategoryType[];
  count: number;
  fileUrl?: string;
  typesCount: number;
  description: string;
  displayOrder: number;
}
export interface CreateCategory {
  name: string;
  dispalyOrder?: number;
}
export interface CategoryListResponse {
  totalCount: number;
  categories: Category[];
}
