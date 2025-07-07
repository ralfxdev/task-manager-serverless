import { DependenciesType } from "../domain/common";
import { UpdateTaskDto } from "../domain/Task";
import * as responseHandler from '../utils/http/response-handler';

export type TypeCaseUseUpdateTaskHttp = (id: string, taskData: UpdateTaskDto, dependencies: DependenciesType) => Promise<any>;

export const updateTaskHttp = (): TypeCaseUseUpdateTaskHttp => {
    return async (id: string, taskData: UpdateTaskDto, dependencies: DependenciesType): Promise<any> => {
        const { dynamoManager } = dependencies;
        try {
            const task = await dynamoManager.update(id, taskData);
            return responseHandler.success("", task)
        } catch (error) {
            throw error;
        }
    };
}
