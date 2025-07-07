import { getAllTaskHttp, TypeCaseUseGetAllTaskHttp } from "./src/cases/getAllTaskCase";
import { getTaskByIdHttp, TypeCaseUseGetTaskByIdHttp } from "./src/cases/getTaskByIdCase";
import { createTaskHttp, TypeCaseUseCreateTaskHttp } from "./src/cases/createTaskCase";
import { updateTaskHttp, TypeCaseUseUpdateTaskHttp } from "./src/cases/updateTaskCase";
import { deleteTaskHttp, TypeCaseUseDeleteTaskHttp } from "./src/cases/deleteTaskCase";

import { getApiGatewayAdapterGetAllTaskHttp } from "./src/infrastructure/driving/aws/api-gateway/getAllTaskAdapter";
import { getApiGatewayAdapterGetTaskByIdHttp } from "./src/infrastructure/driving/aws/api-gateway/getTaskByIdAdapter";
import { getApiGatewayAdapterCreateTaskHttp } from "./src/infrastructure/driving/aws/api-gateway/createTaskAdapter";
import { getApiGatewayAdapterUpdateTaskHttp } from "./src/infrastructure/driving/aws/api-gateway/updateTaskAdapter";
import { getApiGatewayAdapterDeleteTaskHttp } from "./src/infrastructure/driving/aws/api-gateway/deleteTaskAdapter";


// Crear instancias de los casos de uso
const caseUseGetAllTaskHttpGetter: TypeCaseUseGetAllTaskHttp = getAllTaskHttp();
const caseUseGetTaskByIdHttpGetter: TypeCaseUseGetTaskByIdHttp = getTaskByIdHttp();
const caseUseCreateTaskHttpGetter: TypeCaseUseCreateTaskHttp = createTaskHttp();
const caseUseUpdateTaskHttpGetter: TypeCaseUseUpdateTaskHttp = updateTaskHttp();
const caseUseDeleteTaskHttpGetter: TypeCaseUseDeleteTaskHttp = deleteTaskHttp();

// Exportar los handlers
export const getHandlerGetAllTaskHttp = getApiGatewayAdapterGetAllTaskHttp(caseUseGetAllTaskHttpGetter);
export const getHandlerGetTaskByIdHttp = getApiGatewayAdapterGetTaskByIdHttp(caseUseGetTaskByIdHttpGetter);
export const getHandlerCreateTaskHttp = getApiGatewayAdapterCreateTaskHttp(caseUseCreateTaskHttpGetter);
export const getHandlerUpdateTaskHttp = getApiGatewayAdapterUpdateTaskHttp(caseUseUpdateTaskHttpGetter);
export const getHandlerDeleteTaskHttp = getApiGatewayAdapterDeleteTaskHttp(caseUseDeleteTaskHttpGetter);