import { TypeCaseUseCreateTaskHttp } from "../../../../cases/createTaskCase"
import { buildErrorForLambda, buildResponseCreatedForLambda } from "../../../../utils/response";
import { createTaskSchema, validateSchema } from "../../../../utils/validationSchemas";
import { DynamoImpl } from "../../../driven/dynamoManager/DynamoImplementation";

export const getApiGatewayAdapterCreateTaskHttp = (useCase: TypeCaseUseCreateTaskHttp) => async (event: any) => {
    try {
        const taskData = JSON.parse(event.body);
        const body = validateSchema(taskData, createTaskSchema);
        const dynamoManager = new DynamoImpl();
        const dependecies = {
            dynamoManager: dynamoManager
        };
        return buildResponseCreatedForLambda(await useCase(body, dependecies));
    } catch (error) {
        return buildErrorForLambda(error);
    }
}
