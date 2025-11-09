export interface Structure{
    id: number,
    name: string,
    categoryTypeId: number,
    categoryTypeName: string,
    categoryName?: string,
    fileUrl?: string
}

export interface StructureListResponse{
    totalCount: number,
    structures: Structure[]
}

export interface createUpdateStructure{
    name: string,
    typeId: number
}