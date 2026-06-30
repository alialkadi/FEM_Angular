export interface Structure {
  id: number;
  name: string;
  typeId: number;
  typeName: string;
  categoryName?: string;
  fileUrl?: string;
  description: string;
  displayOrder?: number;
}

export interface StructureListResponse {
  totalCount: number;
  structures: Structure[];
}

export interface createUpdateStructure {
  name: string;
  typeId: number;
}
