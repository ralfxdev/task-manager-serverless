export interface HttpResponse {
    statusCode: number;
    body: string;
    headers?: Record<string, string>;
}

export const createHttpResponse = (
    statusCode: number,
    data: any,
    headers?: Record<string, string>
): HttpResponse => {
    return {
        statusCode,
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            ...headers
        }
    };
};

export const createSuccessResponse = (data: any, statusCode: number = 200): HttpResponse => {
    return createHttpResponse(statusCode, data);
};

export const createErrorResponse = (message: string, statusCode: number = 500): HttpResponse => {
    return createHttpResponse(statusCode, { error: message });
};
