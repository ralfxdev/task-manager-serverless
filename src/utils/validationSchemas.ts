import Joi from 'joi';
import createHttpError from "http-errors";
import { Constants } from '../utils/constants';

export const createTaskSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).required(),
    status: Joi.string().valid('pending', 'in-progress', 'completed').default('pending'),
    tags: Joi.array().items(Joi.string()).optional(),
    due_date: Joi.date().iso().optional(),
    estimated_time: Joi.number().integer().min(0).optional(),
    is_high_priority: Joi.boolean().default(false)
});

export const updateTaskSchema = Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid('pending', 'in-progress', 'completed').default('pending'),
    tags: Joi.array().items(Joi.string()).optional(),
    due_date: Joi.date().iso().optional(),
    estimated_time: Joi.number().integer().min(0).optional(),
    is_high_priority: Joi.boolean().default(false)
});

export const getByIdSchema = Joi.object({
    id: Joi.string().uuid().required()
});

export const validateSchema = (data: any, schema: Joi.ObjectSchema) => {
    const { error, value } = schema.validate(data);
    if (error) {
        const errorLambda = Constants.LAMBDA_RESPONSE_ERROR.BAD_REQUEST;
        errorLambda.message = `Invalid request: ${error.details.map(x => x.message).join(', ')}`;
        throw createHttpError(
            Constants.LAMBDA_RESPONSE_ERROR.BAD_REQUEST.httpCode,
            JSON.stringify(errorLambda)
        );
    }
    return value;
};