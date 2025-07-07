interface Response {
    code: string;
    message: string;
    identifier: string;
    datetime: string;
}
export interface ResponseSuccess<T> extends Response {
    data: T
}

export interface ResponseError<T> {
    errors?: T
}