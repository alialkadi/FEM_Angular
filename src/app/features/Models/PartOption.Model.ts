export interface PartOption{
     id: number;
  name: string;
  mainPartName: string;
  mainPartId: number;
  strucutreName: string;
  structureId: number;
  categoryTypeName?: string;
  categoryTypeId?: number;
  categoryName?: string;
  categoryId?: number;
}

export interface PartOptionList {
  totalCount: number;
  partOptions: PartOption[];
}

export interface createUpdatePartOption{
    name?: string,
    mainPartId?: number
}