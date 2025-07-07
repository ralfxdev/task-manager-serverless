import { getApiGatewayAdapterUpdateTaskHttp } from '../../../../../src/infrastructure/driving/aws/api-gateway/updateTaskAdapter';
import { TypeCaseUseUpdateTaskHttp } from '../../../../../src/cases/updateTaskCase';
import { UpdateTaskDto } from '../../../../../src/domain/Task';
import { DynamoImpl } from '../../../../../src/infrastructure/driven/dynamoManager/DynamoImplementation';
import { buildErrorForLambda, buildResponseForLambda } from '../../../../../src/utils/response';
import { getByIdSchema, updateTaskSchema, validateSchema } from '../../../../../src/utils/validationSchemas';

jest.mock('http-errors', () => jest.fn());

jest.mock('../../../../../src/infrastructure/driven/dynamoManager/DynamoImplementation');
jest.mock('../../../../../src/utils/response');
jest.mock('../../../../../src/utils/validationSchemas');

describe('updateTaskAdapter', () => {
  let mockUseCase: jest.MockedFunction<TypeCaseUseUpdateTaskHttp>;
  let mockDynamoImpl: jest.Mocked<DynamoImpl>;
  let mockBuildResponseForLambda: jest.MockedFunction<typeof buildResponseForLambda>;
  let mockBuildErrorForLambda: jest.MockedFunction<typeof buildErrorForLambda>;
  let mockValidateSchema: jest.MockedFunction<typeof validateSchema>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCase = jest.fn();
    mockDynamoImpl = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;
    mockBuildResponseForLambda = buildResponseForLambda as jest.MockedFunction<typeof buildResponseForLambda>;
    mockBuildErrorForLambda = buildErrorForLambda as jest.MockedFunction<typeof buildErrorForLambda>;
    mockValidateSchema = validateSchema as jest.MockedFunction<typeof validateSchema>;

    (DynamoImpl as jest.MockedClass<typeof DynamoImpl>).mockImplementation(() => mockDynamoImpl);
  });

  describe('getApiGatewayAdapterUpdateTaskHttp', () => {
    describe('Success scenarios', () => {
      it('should successfully update a task with valid data', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'Updated Task',
            description: 'Updated Description',
            status: 'in-progress',
            tags: ['updated'],
            due_date: '2024-12-31T00:00:00.000Z',
            estimated_time: 120,
            is_high_priority: true
          })
        };

        const validatedPathData = { id: taskId };
        const validatedBodyData: UpdateTaskDto = {
          title: 'Updated Task',
          description: 'Updated Description',
          status: 'in-progress',
          tags: ['updated'],
          due_date: '2024-12-31T00:00:00.000Z',
          estimated_time: 120,
          is_high_priority: true
        };

        const useCaseResult = {
          success: true,
          message: 'Task updated successfully',
          data: {
            task_id: taskId,
            title: 'Updated Task',
            description: 'Updated Description',
            status: 'in-progress',
            tags: ['updated'],
            due_date: '2024-12-31T00:00:00.000Z',
            estimated_time: 120,
            is_high_priority: true,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z'
          }
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockReturnValueOnce(validatedBodyData);
        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockValidateSchema).toHaveBeenNthCalledWith(2, JSON.parse(event.body), updateTaskSchema);
        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, validatedBodyData, { dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle partial update with only some fields', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'Partially Updated Task',
            status: 'completed'
          })
        };

        const validatedPathData = { id: taskId };
        const validatedBodyData: UpdateTaskDto = {
          title: 'Partially Updated Task',
          status: 'completed'
        };

        const useCaseResult = {
          success: true,
          message: 'Task updated successfully',
          data: {
            task_id: taskId,
            title: 'Partially Updated Task',
            description: 'Original Description',
            status: 'completed',
            tags: ['original'],
            is_high_priority: false,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z'
          }
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockReturnValueOnce(validatedBodyData);
        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockValidateSchema).toHaveBeenNthCalledWith(2, JSON.parse(event.body), updateTaskSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, validatedBodyData, { dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle update with only status change', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            status: 'in-progress'
          })
        };

        const validatedPathData = { id: taskId };
        const validatedBodyData: UpdateTaskDto = {
          status: 'in-progress'
        };

        const useCaseResult = {
          success: true,
          message: 'Task status updated successfully',
          data: {
            task_id: taskId,
            title: 'Original Task',
            description: 'Original Description',
            status: 'in-progress',
            tags: ['original'],
            is_high_priority: false,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z'
          }
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockReturnValueOnce(validatedBodyData);
        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockValidateSchema).toHaveBeenNthCalledWith(2, JSON.parse(event.body), updateTaskSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, validatedBodyData, { dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle use case returning null', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'Updated Task'
          })
        };

        const validatedPathData = { id: taskId };
        const validatedBodyData: UpdateTaskDto = {
          title: 'Updated Task'
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(null)
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockReturnValueOnce(validatedBodyData);
        mockUseCase.mockResolvedValue(null);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockValidateSchema).toHaveBeenNthCalledWith(2, JSON.parse(event.body), updateTaskSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, validatedBodyData, { dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(null);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle use case returning undefined', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'Updated Task'
          })
        };

        const validatedPathData = { id: taskId };
        const validatedBodyData: UpdateTaskDto = {
          title: 'Updated Task'
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(undefined)
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockReturnValueOnce(validatedBodyData);
        mockUseCase.mockResolvedValue(undefined);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockValidateSchema).toHaveBeenNthCalledWith(2, JSON.parse(event.body), updateTaskSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, validatedBodyData, { dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(undefined);
        expect(result).toEqual(expectedResponse);
      });
    });

    describe('Error handling scenarios', () => {
      it('should handle JSON parsing errors', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: 'invalid json'
        };

        const validatedPathData = { id: taskId };
        const jsonError = new SyntaxError('Unexpected token i in JSON at position 0');
        const expectedErrorResponse = {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
            statusCode: 500
          })
        };

        mockValidateSchema.mockReturnValueOnce(validatedPathData);
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const originalParse = JSON.parse;
        JSON.parse = jest.fn().mockImplementation((text) => {
          if (text === 'invalid json') {
            throw jsonError;
          }
          return originalParse(text);
        });

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(JSON.parse).toHaveBeenCalledWith(event.body);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(jsonError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();

        JSON.parse = originalParse;
      });

      it('should handle path parameter validation errors', async () => {
        const event = {
          pathParameters: {
            id: 'invalid-uuid'
          },
          body: JSON.stringify({
            title: 'Updated Task'
          })
        };

        const validationError = new Error(JSON.stringify({
          code: 'BAD_REQUEST',
          message: 'Invalid request: id must be a valid UUID',
          statusCode: 400
        }));
        (validationError as any).statusCode = 400;

        const expectedErrorResponse = {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'BAD_REQUEST',
            message: 'Invalid request: id must be a valid UUID',
            statusCode: 400
          })
        };

        mockValidateSchema.mockImplementation(() => {
          throw validationError;
        });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });

      it('should handle body validation errors', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'A',
            status: 'invalid-status'
          })
        };

        const validatedPathData = { id: taskId };
        const validationError = new Error(JSON.stringify({
          code: 'BAD_REQUEST',
          message: 'Invalid request: title must be at least 3 characters long, status must be one of pending, in-progress, completed',
          statusCode: 400
        }));
        (validationError as any).statusCode = 400;

        const expectedErrorResponse = {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'BAD_REQUEST',
            message: 'Invalid request: title must be at least 3 characters long, status must be one of pending, in-progress, completed',
            statusCode: 400
          })
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockImplementationOnce(() => {
            throw validationError;
          });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockValidateSchema).toHaveBeenNthCalledWith(2, JSON.parse(event.body), updateTaskSchema);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });

      it('should handle use case errors', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'Updated Task'
          })
        };

        const validatedPathData = { id: taskId };
        const validatedBodyData: UpdateTaskDto = {
          title: 'Updated Task'
        };

        const useCaseError = new Error(JSON.stringify({
          code: 'NOT_FOUND',
          message: 'Task not found',
          statusCode: 404
        }));
        (useCaseError as any).statusCode = 404;

        const expectedErrorResponse = {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'NOT_FOUND',
            message: 'Task not found',
            statusCode: 404
          })
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockReturnValueOnce(validatedBodyData);
        mockUseCase.mockRejectedValue(useCaseError);
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockValidateSchema).toHaveBeenNthCalledWith(2, JSON.parse(event.body), updateTaskSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, validatedBodyData, { dynamoManager: mockDynamoImpl });
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(useCaseError);
        expect(result).toEqual(expectedErrorResponse);
      });

      it('should handle DynamoImpl instantiation errors', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'Updated Task'
          })
        };

        const validatedPathData = { id: taskId };
        const validatedBodyData: UpdateTaskDto = {
          title: 'Updated Task'
        };

        const dynamoError = new Error('DynamoDB initialization failed');
        const expectedErrorResponse = {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
            statusCode: 500
          })
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockReturnValueOnce(validatedBodyData);
        (DynamoImpl as jest.MockedClass<typeof DynamoImpl>).mockImplementation(() => {
          throw dynamoError;
        });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockValidateSchema).toHaveBeenNthCalledWith(2, JSON.parse(event.body), updateTaskSchema);
        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(dynamoError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });

      it('should handle generic runtime error', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'Updated Task'
          })
        };

        const validatedPathData = { id: taskId };
        const genericError = new Error('Unexpected runtime error');
        const expectedErrorResponse = {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
            statusCode: 500
          })
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockImplementation(() => {
            throw genericError;
          });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(genericError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });
    });

    describe('Edge cases', () => {
      it('should handle empty body', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: '{}'
        };

        const validatedPathData = { id: taskId };
        const validationError = new Error(JSON.stringify({
          code: 'BAD_REQUEST',
          message: 'Invalid request: At least one field must be provided for update',
          statusCode: 400
        }));
        (validationError as any).statusCode = 400;

        const expectedErrorResponse = {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'BAD_REQUEST',
            message: 'Invalid request: At least one field must be provided for update',
            statusCode: 400
          })
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockImplementationOnce(() => {
            throw validationError;
          });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockValidateSchema).toHaveBeenNthCalledWith(2, {}, updateTaskSchema);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
        expect(result).toEqual(expectedErrorResponse);
      });

      it('should handle null body', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: null
        };

        const validatedPathData = { id: taskId };
        const nullError = new TypeError('Cannot read properties of null');
        const expectedErrorResponse = {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
            statusCode: 500
          })
        };

        mockValidateSchema.mockReturnValueOnce(validatedPathData);
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const originalParse = JSON.parse;
        JSON.parse = jest.fn().mockImplementation((text) => {
          if (text === null) {
            throw nullError;
          }
          return originalParse(text);
        });

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(JSON.parse).toHaveBeenCalledWith(event.body);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(nullError);
        expect(result).toEqual(expectedErrorResponse);

        JSON.parse = originalParse;
      });

      it('should handle missing pathParameters', async () => {
        const event = {
          pathParameters: null,
          body: JSON.stringify({
            title: 'Updated Task'
          })
        };

        const validationError = new Error(JSON.stringify({
          code: 'BAD_REQUEST',
          message: 'Invalid request: pathParameters cannot be null',
          statusCode: 400
        }));
        (validationError as any).statusCode = 400;

        const expectedErrorResponse = {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'BAD_REQUEST',
            message: 'Invalid request: pathParameters cannot be null',
            statusCode: 400
          })
        };

        mockValidateSchema.mockImplementation(() => {
          throw validationError;
        });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });

      it('should handle large update data', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const largeDescription = 'A'.repeat(500); // Maximum allowed length
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'Task with Large Description',
            description: largeDescription,
            status: 'in-progress',
            tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
            due_date: '2024-12-31T23:59:59.000Z',
            estimated_time: 99999,
            is_high_priority: true
          })
        };

        const validatedPathData = { id: taskId };
        const validatedBodyData: UpdateTaskDto = {
          title: 'Task with Large Description',
          description: largeDescription,
          status: 'in-progress',
          tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
          due_date: '2024-12-31T23:59:59.000Z',
          estimated_time: 99999,
          is_high_priority: true
        };

        const useCaseResult = {
          success: true,
          message: 'Task updated successfully',
          data: {
            task_id: taskId,
            ...validatedBodyData,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z'
          }
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockReturnValueOnce(validatedBodyData);
        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockValidateSchema).toHaveBeenNthCalledWith(2, JSON.parse(event.body), updateTaskSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, validatedBodyData, { dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle special characters in update data', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'Task with "quotes" & special chars: áéíóú',
            description: 'Description with <HTML> tags & símbolos especiales',
            tags: ['特殊字符', 'émojis😀', 'русский']
          })
        };

        const validatedPathData = { id: taskId };
        const validatedBodyData: UpdateTaskDto = {
          title: 'Task with "quotes" & special chars: áéíóú',
          description: 'Description with <HTML> tags & símbolos especiales',
          tags: ['特殊字符', 'émojis😀', 'русский']
        };

        const useCaseResult = {
          success: true,
          message: 'Task updated successfully',
          data: {
            task_id: taskId,
            ...validatedBodyData,
            status: 'pending',
            is_high_priority: false,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z'
          }
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockReturnValueOnce(validatedBodyData);
        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenNthCalledWith(1, event.pathParameters, getByIdSchema);
        expect(mockValidateSchema).toHaveBeenNthCalledWith(2, JSON.parse(event.body), updateTaskSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, validatedBodyData, { dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(result).toEqual(expectedResponse);
      });
    });

    describe('Dependencies injection', () => {
      it('should correctly inject DynamoImpl instance to use case', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'Updated Task'
          })
        };

        const validatedPathData = { id: taskId };
        const validatedBodyData: UpdateTaskDto = {
          title: 'Updated Task'
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockReturnValueOnce(validatedBodyData);
        mockUseCase.mockResolvedValue({ success: true });
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true })
        });

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, validatedBodyData, {
          dynamoManager: mockDynamoImpl
        });
      });

      it('should create a new DynamoImpl instance for each request', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'Updated Task'
          })
        };

        const validatedPathData = { id: taskId };
        const validatedBodyData: UpdateTaskDto = {
          title: 'Updated Task'
        };

        mockValidateSchema
          .mockReturnValue(validatedPathData)
          .mockReturnValue(validatedBodyData);
        mockUseCase.mockResolvedValue({ success: true });
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true })
        });

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        await adapter(event);
        await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(2);
      });

      it('should pass exact parameters from validation to use case', async () => {
        // Arrange
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'Specific Updated Task',
            status: 'completed'
          })
        };

        const validatedPathData = { id: taskId };
        const validatedBodyData: UpdateTaskDto = {
          title: 'Specific Updated Task',
          status: 'completed'
        };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockReturnValueOnce(validatedBodyData);
        mockUseCase.mockResolvedValue({ success: true });
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true })
        });

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        await adapter(event);

        expect(mockUseCase).toHaveBeenCalledWith(taskId, validatedBodyData, {
          dynamoManager: mockDynamoImpl
        });
      });
    });

    describe('Response handling', () => {
      it('should always use buildResponseForLambda for success responses', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          },
          body: JSON.stringify({
            title: 'Updated Task'
          })
        };

        const validatedPathData = { id: taskId };
        const validatedBodyData: UpdateTaskDto = {
          title: 'Updated Task'
        };
        const useCaseResult = { success: true, updated: true };

        mockValidateSchema
          .mockReturnValueOnce(validatedPathData)
          .mockReturnValueOnce(validatedBodyData);
        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        });

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        await adapter(event);

        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(mockBuildResponseForLambda).toHaveBeenCalledTimes(1);
        expect(mockBuildErrorForLambda).not.toHaveBeenCalled();
      });

      it('should always use buildErrorForLambda for error responses', async () => {
        const event = {
          pathParameters: {
            id: 'invalid-id'
          },
          body: JSON.stringify({
            title: 'Updated Task'
          })
        };

        const validationError = new Error('Validation failed');
        
        mockValidateSchema.mockImplementation(() => {
          throw validationError;
        });
        mockBuildErrorForLambda.mockReturnValue({
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Bad Request' })
        });

        const adapter = getApiGatewayAdapterUpdateTaskHttp(mockUseCase);
        await adapter(event);

        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
        expect(mockBuildErrorForLambda).toHaveBeenCalledTimes(1);
        expect(mockBuildResponseForLambda).not.toHaveBeenCalled();
      });
    });
  });
});
