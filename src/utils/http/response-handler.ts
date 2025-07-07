
import { UtilDate } from '../date/utils-date';
import { ResponseSuccess } from '../../domain/responses/response';
import { Constants } from '../constants';

export const success = (identifier?: string, data?: any, message?: string) => {
    const resp: ResponseSuccess<any> = {
        code: Constants.HTTP_CODES_RESPONSE.SUCCESSFUL_OPERATION.code,
        message: message || Constants.HTTP_CODES_RESPONSE.SUCCESSFUL_OPERATION.message,
        identifier: identifier || '',
        datetime: UtilDate.getResponseDate(),
        data
    }
    return resp;
}

export const created = (identifier?: string, data?: any, message?: string) => {

    const resp: ResponseSuccess<any> = {
        code: Constants.HTTP_CODES_RESPONSE.CREATED.code,
        message: message || Constants.HTTP_CODES_RESPONSE.CREATED.message,
        identifier: identifier || '',
        datetime: UtilDate.getResponseDate(),
        data
    }
    return resp;
}

export const badRequestError = (code?: string) => {
    throw new Error(code || 'BAD_REQUEST');
}

export const notFoundError = (code?: string) => {
    throw new Error(code || 'NOT_FOUND');
}

export const conflictError = (code?: string) => {
    throw Error(code || 'CONFLICT');
}

