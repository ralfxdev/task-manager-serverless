import { TypeCaseUseGetAllTaskHttp } from "../../../../cases/getAllTaskCase"
import { buildErrorForLambda, buildResponseForLambda } from "../../../../utils/response";
import { DynamoImpl } from "../../../driven/dynamoManager/DynamoImplementation";

export const getApiGatewayAdapterGetAllTaskHttp = (useCase: TypeCaseUseGetAllTaskHttp) => async (event: any) => {
    try {
        const dynamoManager = new DynamoImpl();
        const dependecies = {
            dynamoManager: dynamoManager
        };
        return buildResponseForLambda(await useCase(dependecies));
    } catch (error) {
        console.log("Error in getApiGatewayAdapterGetAllTaskHttp:", error);
        return buildErrorForLambda(error);
    }
}