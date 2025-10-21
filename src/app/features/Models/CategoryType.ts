export interface CategoryType {
  id: number;
  name: string;
  categoryId?: number | null;
  categoryName?: string | null;
  fileUrl?: string | null;
}
export interface CategoryTypeListResponse {
  totalCount: number;
  categoryTypes: CategoryType[];
}

export interface CreateCategoryType{
  name: string;
  categoryId:number
}