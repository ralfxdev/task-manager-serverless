import { TypeCaseUseGetTaskByIdHttp } from "../../../../cases/getTaskByIdCase"
import { buildErrorForLambda, buildResponseForLambda } from "../../../../utils/response";
import { getByIdSchema, validateSchema } from "../../../../utils/validationSchemas";
import { DynamoImpl } from "../../../driven/dynamoManager/DynamoImplementation";

export const getApiGatewayAdapterGetTaskByIdHttp = (useCase: TypeCaseUseGetTaskByIdHttp) => async (event: any) => {
    try {
        const {id} = validateSchema(event.pathParameters, getByIdSchema);
        const dynamoManager = new DynamoImpl();
        const dependecies = {
            dynamoManager: dynamoManager
        };
        return buildResponseForLambda(await useCase(id, dependecies));
    } catch (error) {
        return buildErrorForLambda(error);
    }
}
