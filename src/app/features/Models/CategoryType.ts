export interface CategoryType {
  id: number;
  name: string;
  categoryId?: number | null;
  categoryName?: string | null;
  description: string;
  fileUrl?: string | null;
}
export interface CategoryTypeListResponse {
  totalCount: number;
  categoryTypes: CategoryType[];
}

export interface CreateCategoryType {
  name: string;
  categoryId: number;
  description: string;
}
