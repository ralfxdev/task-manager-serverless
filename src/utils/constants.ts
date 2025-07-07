export abstract class Constants {
    static readonly TABLE_NAME = "task_manager";

    static readonly LAMBDA_RESPONSE_ERROR = {
        INTERNAL_ERROR: {
            httpCode: 500,
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            message: 'Internal error'
        },
        NOT_FOUND: {
            httpCode: 404,
            statusCode: 404,
            code: 'RESOURCE_NOT_FOUND',
            message: 'Resource Not Found'
        },
        BAD_REQUEST: {
            httpCode: 400,
            statusCode: 400,
            code: 'BAD_REQUEST',
            message: 'Bad request'
        },
        ALREADY_EXISTS: {
            httpCode: 409,
            statusCode: 409,
            code: 'ALREADY_EXISTS',
            message: 'User Already exists'
        },
    };

    static readonly HTTP_CODES_RESPONSE = {
        SUCCESSFUL_OPERATION: {
            httpCode: 200,
            code: 'SUCCESSFUL_OPERATION',
            message: 'The request has been successful.'
        },
        CREATED: {
            httpCode: 201,
            code: 'CREATED',
            message: 'Created'
        },
        NO_CONTENT: {
            httpCode: 204,
            code: 'NO_CONTENT',
            message: 'No Content'
        },
        DUPLICATE_RECORD: {
            httpCode: 400,
            code: 'DUPLICATE_RECORD',
            message: 'Favorite already exists'
        },
        BAD_REQUEST: {
            httpCode: 400,
            code: 'BAD_REQUEST',
            message: 'Bad Request'
        },
        INVALID_COLLECTION_DATA: {
            httpCode: 400,
            code: 'INVALID_COLLECTION_DATA',
            message: 'The collection data is invalid'
        },
        USER_NOT_FOUND: {
            httpCode: 404,
            code: 'USER_NOT_FOUND',
            message: 'User Cobis Id Not Found.'
        },
        USER_NOT_EXISTS: {
            httpCode: 404,
            code: 'USER_NOT_EXISTS',
            message: 'User does not exists.'
        },
        METHOD_NOT_ALLOWED: {
            httpCode: 405,
            code: 'METHOD_NOT_ALLOWED',
            message: 'Unauthorized service.'
        },
        UNAUTHORIZED: {
            httpCode: 401,
            code: 'UNAUTHORIZED',
            message: 'Unauthorized.'
        },
        NOT_FOUND: {
            httpCode: 404,
            code: 'NOT_FOUND',
            message: 'Data not found'
        },
        UNPROCESSABLE_ENTITY: {
            httpCode: 422,
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Processing Error.'
        },
        UNPROCESSABLE_CHANGE_STATE: {
            httpCode: 422,
            code: 'UNPROCESSABLE_CHANGE_STATE',
            message: 'Only allowed to change to active or locked state'
        },
        INTERNAL_ERROR: {
            httpCode: 500,
            code: 'INTERNAL_ERROR',
            message: 'Internal Server Error.'
        },
        SERVICE_NOT_AVAILABLE: {
            httpCode: 503,
            code: 'SERVICE_NOT_AVAILABLE',
            message: 'Service not available.'
        },

    };

    static readonly RESPONSE_HEADERS = { 'Content-Type': 'application/json', APPLICATION_JSON: { "Content-Type": "application/json" } };

    static readonly REGEX = {
        AMZ_TRACE_ID: /^(Root=\d-)+(.*)$/,
        // eslint-disable-next-line max-len
        UUID_V4:
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    };

    static readonly TIME_ZONE = 'America/Guatemala';
    static readonly DATE_FORMAT_DAY_HOUR = 'YYYY-MM-DD[T]HH:mm:ss.SSS';
}
