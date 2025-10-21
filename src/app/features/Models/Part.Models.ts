export interface Part{
    id: number,
    name: string,
    strucutreName: string,
    structureId: number,
    categoryName: string,
    categoryId: number,
    categoryTypeName: string,
    categoryTypeId: number
}

export interface PartListResponse{
    totalNumber: number,
    parts: Part[]
}

export interface createUpdatePart{
    id?: number, 
    name: string
}