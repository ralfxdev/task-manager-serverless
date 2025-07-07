import { DependenciesType } from "../domain/common";
import * as responseHandler from '../utils/http/response-handler';

export type TypeCaseUseDeleteTaskHttp = (id: string, dependencies: DependenciesType) => Promise<any>;

export const deleteTaskHttp = (): TypeCaseUseDeleteTaskHttp => {
    return async (id: string, dependencies: DependenciesType): Promise<any> => {
        const { dynamoManager } = dependencies;
        try {
            const deleted = await dynamoManager.delete(id);
            return responseHandler.success("", deleted);
        } catch (error) {
            throw error;
        }
    };
}
