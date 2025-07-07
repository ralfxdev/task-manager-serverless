import { TypeCaseUseDeleteTaskHttp } from "../../../../cases/deleteTaskCase"
import { buildErrorForLambda, buildResponseDeletedForLambda } from "../../../../utils/response";
import { getByIdSchema, validateSchema } from "../../../../utils/validationSchemas";
import { DynamoImpl } from "../../../driven/dynamoManager/DynamoImplementation";

export const getApiGatewayAdapterDeleteTaskHttp = (useCase: TypeCaseUseDeleteTaskHttp) => async (event: any) => {
    try {
        const {id} = validateSchema(event.pathParameters, getByIdSchema);
        const dynamoManager = new DynamoImpl();
        const dependecies = {
            dynamoManager: dynamoManager
        };
        return buildResponseDeletedForLambda(await useCase(id, dependecies));
    } catch (error) {
        return buildErrorForLambda(error);
    }
}
