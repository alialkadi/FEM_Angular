export interface ServiceResponse{
    id?: number,
    name?: string,
    description?: string,
    baseCost?: number,
    warrantyDuration?: number,
    warrantyUnit?: string,
    deliveryDays?: number,
    structureId?: number,
    partId?: number,
    partOptionId?: number,
    partName?: string,
    structureName?: string,
    partOptionName?: string
    
}

export interface ServiceListResponse{
    totalNumber?: number,
    services: ServiceResponse[]
}

export interface createUpdateServiceRequest{
    id?: number,
    name?: string,
    description?: string,
    baseCost?: number,
    warrentyDuration?: number,
    warrantyUnit?: string,
    deliveryDays?: number,
    structureId?: number,
    partId?: number,
    partOptionId?: number
}

export interface ServiceStep{
    id?: number,
    serviceId?: number,
    description?: string,
    serviceName?: string,
    stepOrder?:number
}

export interface CreateServiceStep {
    serviceId?: number,
    description?: string
}

export interface UpdateServiceStep {
    id?: number,
    serviceId?: number,
    description?: string
}


export interface ServiceStepListResponse{
    totalCount?: number,
    serviceSteps?: ServiceStep[]
}