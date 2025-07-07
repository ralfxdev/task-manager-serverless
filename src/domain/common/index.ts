import { DynamoManager } from "../../infrastructure/driven/dynamoManager/DynamoManager";

export type DependenciesType = {
    dynamoManager: DynamoManager;
}

export type AdditionalElementsType = {
    token: string;
    traceId: string;
    ip: string;
    os: string;
}

export interface Output {
    code: string;
    message: string;
    datetime: string;
    identifier: string;
}

export interface OutputWithData<T> {
    code: string;
    message: string;
    datetime: string;
    identifier: string;
    data: T;
}

