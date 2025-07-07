import createHttpError from "http-errors";
import { AdditionalElementsType } from "../domain/common";
import { Constants } from "./constants";
import { Utils } from "./utils";

export function getAdditionalElements(event: any): AdditionalElementsType {
    const headers = event.headers;
    const authorization = Utils.getTokenFromHeaders(headers);
    const token = Utils.getTokenFromHeader(authorization);
    let ip = "UNDEFINED";
    let os = "UNDEFINED";
    if (event["requestContext"] && event["requestContext"]["identity"]) {
        ip = event["requestContext"]["identity"]["sourceIp"];
        os = event["requestContext"]["identity"]["userAgent"];
    } else if (event["requestContext"] && event["requestContext"]["http"]) {
        ip = event["requestContext"]["http"]["sourceIp"];
        os = event["requestContext"]["http"]["userAgent"];
    }
    return {
        token: token,
        traceId: "",
        ip: ip,
        os: os
    }
}

export const sendResponse = async (statusCode: number, body: any, headers = {}) => ({
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/json",
        ...headers,
    },
    statusCode,
    body: JSON.stringify(body),
});

//@ts-ignore
export function proccessResponseFromLambda(inputLambda: any, resultLambda: any, logger: any) {
    const payload = Utils.parseStringToJson(resultLambda.Payload);
    const detailResponse = Utils.parseStringToJson(payload);
    return detailResponse.data;
}

export function getResponseFromLambda(payload: any): any {
    const statusCode = payload.statusCode;
    if (statusCode !== 200 && statusCode !== 201) {
        throw createHttpError(statusCode, JSON.stringify(Constants.LAMBDA_RESPONSE_ERROR.INTERNAL_ERROR));
    }
    return Utils.parseStringToJson(payload.body);
}