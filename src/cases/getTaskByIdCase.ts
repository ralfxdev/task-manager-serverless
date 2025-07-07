import createHttpError from "http-errors";
import { DependenciesType } from "../domain/common";
import * as responseHandler from '../utils/http/response-handler';
import { Constants } from "../utils/constants";

export type TypeCaseUseGetTaskByIdHttp = (id: string, dependencies: DependenciesType) => Promise<any>;

export const getTaskByIdHttp = (): TypeCaseUseGetTaskByIdHttp => {
    return async (id: string, dependencies: DependenciesType): Promise<any> => {
        const { dynamoManager } = dependencies;
        try {
            const task = await dynamoManager.findById(id);
            if (!task) {
                throw createHttpError(
                Constants.LAMBDA_RESPONSE_ERROR.NOT_FOUND.httpCode,
                JSON.stringify(Constants.LAMBDA_RESPONSE_ERROR.NOT_FOUND)
            );
            }
            return responseHandler.success("", task)
        } catch (error) {
            throw error;
        }
    };
}
