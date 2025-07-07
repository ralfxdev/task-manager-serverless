import { DependenciesType } from "../domain/common";
import * as responseHandler from '../utils/http/response-handler';

export type TypeCaseUseGetAllTaskHttp = (dependencies: DependenciesType) => Promise<any>;

export const getAllTaskHttp = (): TypeCaseUseGetAllTaskHttp => {
    return async (dependencies: DependenciesType): Promise<any> => {
        const { dynamoManager } = dependencies;
        try {
            const tasks = await dynamoManager.findAll();
            return responseHandler.success("", tasks)
        } catch (error) {
            throw error;
        }
    };
}