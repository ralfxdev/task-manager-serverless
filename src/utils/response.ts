//@ts-ignore
import createHttpError from 'http-errors';
import { Constants } from './constants';
import { AdditionalElementsType } from '../domain/common';
import { Utils } from './utils';

export function buildResponseForLambda(response: any) {
  console.log("Response for Lambda:", response);
  const responseAsLambda = {
    statusCode: Constants.HTTP_CODES_RESPONSE.SUCCESSFUL_OPERATION.httpCode,
    headers: Constants.RESPONSE_HEADERS.APPLICATION_JSON,
    body: JSON.stringify(response)
  };
  return responseAsLambda;
}

export function buildResponseCreatedForLambda(response: any) {
  const responseAsLambda = {
    statusCode: Constants.HTTP_CODES_RESPONSE.CREATED.httpCode,
    headers: Constants.RESPONSE_HEADERS.APPLICATION_JSON,
    body: JSON.stringify(response)
  };
  return responseAsLambda;
}

export function buildResponseDeletedForLambda(response: any) {
  const responseAsLambda = {
    statusCode: Constants.HTTP_CODES_RESPONSE.NO_CONTENT.httpCode,
    headers: Constants.RESPONSE_HEADERS.APPLICATION_JSON,
    body: JSON.stringify(response)
  };
  return responseAsLambda;
}

export function buildErrorForLambda(error: any) {
  if (error && error.statusCode > 0) {
    let errorMessage = error.message;
    let errorCode = error.name;

    try {
      const parsedMessage = JSON.parse(error.message);
      if (parsedMessage && parsedMessage.message) {
        errorMessage = parsedMessage.message;
        errorCode = parsedMessage.code || error.name;
      }
    } catch (e) {
      errorMessage = error.message;
    }

    const responseAsLambda = {
      statusCode: error.statusCode,
      headers: Constants.RESPONSE_HEADERS.APPLICATION_JSON,
      body: JSON.stringify({
        code: errorCode,
        message: errorMessage,
        statusCode: error.statusCode
      })
    };
    return responseAsLambda;
  }

  const responseAsLambda = {
    statusCode: Constants.LAMBDA_RESPONSE_ERROR.INTERNAL_ERROR.statusCode,
    headers: Constants.RESPONSE_HEADERS.APPLICATION_JSON,
    body: JSON.stringify({
      code: Constants.LAMBDA_RESPONSE_ERROR.INTERNAL_ERROR.code,
      message: Constants.LAMBDA_RESPONSE_ERROR.INTERNAL_ERROR.message,
      statusCode: Constants.LAMBDA_RESPONSE_ERROR.INTERNAL_ERROR.statusCode
    })
  };
  return responseAsLambda;
}

export function parseError(error: any) {
  const parsedError = JSON.parse(error.message);
  return {
    statusCode: parsedError.statusCode || 500,
    headers: Constants.RESPONSE_HEADERS.APPLICATION_JSON,
    body: JSON.stringify({
      httpCode: parsedError.httpCode,
      statusCode: parsedError.statusCode,
      code: parsedError.code,
      message: parsedError.message,
    }),
  };
}

export function buildErrForLambda(error: any) {
  const err = Utils.parseStringToJson(error);
  const responsesCodes: any = Constants.HTTP_CODES_RESPONSE;
  const responseError = Object.keys(responsesCodes).filter(
    (responseCode) => responsesCodes[`${responseCode}`].code === err.message
  );
  if (Utils.isEmpty(responseError))
    return createHttpError(
      Constants.HTTP_CODES_RESPONSE.INTERNAL_ERROR.httpCode,
      JSON.stringify({
        code: Constants.HTTP_CODES_RESPONSE.INTERNAL_ERROR.code,
        message: Constants.HTTP_CODES_RESPONSE.INTERNAL_ERROR.message
      })
    );
  return createHttpError(
    responsesCodes[`${responseError.toString()}`].httpCode,
    JSON.stringify({
      code: responsesCodes[`${responseError.toString()}`].code,
      message: responsesCodes[`${responseError.toString()}`].message
    })
  );
}

export function buildResForLambda(
  additionalElements: AdditionalElementsType,
  logger: any,
  //@ts-ignore
  response?: any
) {
  let responseAsLambda;
  if (typeof response !== undefined) {
    responseAsLambda = {
      statusCode: Constants.HTTP_CODES_RESPONSE.SUCCESSFUL_OPERATION.httpCode,
      headers: Constants.RESPONSE_HEADERS,
      body: JSON.stringify({
        code: Constants.HTTP_CODES_RESPONSE.SUCCESSFUL_OPERATION.code,
        message: Constants.HTTP_CODES_RESPONSE.SUCCESSFUL_OPERATION.message,
        identifier: additionalElements.traceId,
        datetime: Utils.formatDate(new Date().getTime()),
        data: response
      })
    };
  } else {
    responseAsLambda = {
      statusCode: Constants.HTTP_CODES_RESPONSE.SUCCESSFUL_OPERATION.httpCode,
      headers: Constants.RESPONSE_HEADERS,
      body: JSON.stringify({
        code: Constants.HTTP_CODES_RESPONSE.SUCCESSFUL_OPERATION.code,
        message: Constants.HTTP_CODES_RESPONSE.SUCCESSFUL_OPERATION.message,
        identifier: additionalElements.traceId,
        datetime: Utils.formatDate(new Date().getTime())
      })
    };
  }
  return responseAsLambda;
}
