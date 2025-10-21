import { CategoryType } from "./CategoryType";

export interface Category {
  id?: number;
  name: string;
  types: CategoryType[];
  count: number;
  typesCount: number;
}
export interface CreateCategory{
  name: string;
}
export interface CategoryListResponse {
  totalCount: number;
  categories: Category[];
}