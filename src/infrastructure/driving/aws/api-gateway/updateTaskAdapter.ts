import { TypeCaseUseUpdateTaskHttp } from "../../../../cases/updateTaskCase"
import { buildErrorForLambda, buildResponseForLambda } from "../../../../utils/response";
import { getByIdSchema, updateTaskSchema, validateSchema } from "../../../../utils/validationSchemas";
import { DynamoImpl } from "../../../driven/dynamoManager/DynamoImplementation";

export const getApiGatewayAdapterUpdateTaskHttp = (useCase: TypeCaseUseUpdateTaskHttp) => async (event: any) => {
    try {
        const {id} = validateSchema(event.pathParameters, getByIdSchema);
        const taskData = JSON.parse(event.body);
        const body = validateSchema(taskData, updateTaskSchema);
        const dynamoManager = new DynamoImpl();
        const dependecies = {
            dynamoManager: dynamoManager
        };
        return  buildResponseForLambda(await useCase(id, body, dependecies));
    } catch (error) {
        return buildErrorForLambda(error);
    }
}
