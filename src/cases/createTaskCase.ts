import { DependenciesType } from "../domain/common";
import { CreateTaskDto } from "../domain/Task";
import * as responseHandler from '../utils/http/response-handler';

export type TypeCaseUseCreateTaskHttp = (taskData: CreateTaskDto, dependencies: DependenciesType) => Promise<any>;

export const createTaskHttp = (): TypeCaseUseCreateTaskHttp => {
    return async (taskData: CreateTaskDto, dependencies: DependenciesType): Promise<any> => {
        const { dynamoManager } = dependencies;
        try {
            const task = await dynamoManager.create(taskData);
            return responseHandler.success("", task)
        } catch (error) {
            throw error;
        }
    };
}
