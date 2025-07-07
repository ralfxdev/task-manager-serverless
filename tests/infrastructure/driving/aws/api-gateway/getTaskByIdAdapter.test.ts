import { getApiGatewayAdapterGetTaskByIdHttp } from '../../../../../src/infrastructure/driving/aws/api-gateway/getTaskByIdAdapter';
import { TypeCaseUseGetTaskByIdHttp } from '../../../../../src/cases/getTaskByIdCase';
import { DynamoImpl } from '../../../../../src/infrastructure/driven/dynamoManager/DynamoImplementation';
import { buildErrorForLambda, buildResponseForLambda } from '../../../../../src/utils/response';
import { getByIdSchema, validateSchema } from '../../../../../src/utils/validationSchemas';

jest.mock('http-errors', () => jest.fn());

jest.mock('../../../../../src/infrastructure/driven/dynamoManager/DynamoImplementation');
jest.mock('../../../../../src/utils/response');
jest.mock('../../../../../src/utils/validationSchemas');

describe('getTaskByIdAdapter', () => {
  let mockUseCase: jest.MockedFunction<TypeCaseUseGetTaskByIdHttp>;
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

  describe('getApiGatewayAdapterGetTaskByIdHttp', () => {
    describe('Success scenarios', () => {
      it('should successfully get a task with valid UUID', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const validatedData = { id: taskId };
        
        const useCaseResult = {
          success: true,
          message: 'Task retrieved successfully',
          data: {
            task_id: taskId,
            title: 'Test Task',
            description: 'Test Description',
            status: 'pending',
            tags: ['test'],
            due_date: '2024-12-31T00:00:00.000Z',
            estimated_time: 60,
            is_high_priority: false,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
          }
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, { dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle different UUID formats', async () => {
        const taskId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const validatedData = { id: taskId };
        
        const useCaseResult = {
          success: true,
          message: 'Task retrieved successfully',
          data: {
            task_id: taskId,
            title: 'Another Task',
            description: 'Another Description',
            status: 'completed',
            tags: ['production'],
            is_high_priority: true,
            created_at: '2024-01-01T00:00:00.000Z'
          }
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, { dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle use case returning null (task not found)', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const validatedData = { id: taskId };
        
        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(null)
        };

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockResolvedValue(null);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, { dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(null);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle use case returning undefined', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const validatedData = { id: taskId };
        
        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(undefined)
        };

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockResolvedValue(undefined);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, { dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(undefined);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle use case returning empty object', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const validatedData = { id: taskId };
        const useCaseResult = {};

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, { dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(result).toEqual(expectedResponse);
      });
    });

    describe('Error handling scenarios', () => {
      it('should handle validation errors from validateSchema', async () => {
        const event = {
          pathParameters: {
            id: 'invalid-uuid'
          }
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

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });

      it('should handle missing id in pathParameters', async () => {
        const event = {
          pathParameters: {}
        };

        const validationError = new Error(JSON.stringify({
          code: 'BAD_REQUEST',
          message: 'Invalid request: id is required',
          statusCode: 400
        }));
        (validationError as any).statusCode = 400;

        const expectedErrorResponse = {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'BAD_REQUEST',
            message: 'Invalid request: id is required',
            statusCode: 400
          })
        };

        mockValidateSchema.mockImplementation(() => {
          throw validationError;
        });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });

      it('should handle null pathParameters', async () => {
        const event = {
          pathParameters: null
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

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });

      it('should handle undefined pathParameters', async () => {
        const event = {};

        const validationError = new Error(JSON.stringify({
          code: 'BAD_REQUEST',
          message: 'Invalid request: pathParameters is required',
          statusCode: 400
        }));
        (validationError as any).statusCode = 400;

        const expectedErrorResponse = {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'BAD_REQUEST',
            message: 'Invalid request: pathParameters is required',
            statusCode: 400
          })
        };

        mockValidateSchema.mockImplementation(() => {
          throw validationError;
        });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(undefined, getByIdSchema);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });

      it('should handle use case errors (task not found)', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const validatedData = { id: taskId };
        
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

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockRejectedValue(useCaseError);
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, { dynamoManager: mockDynamoImpl });
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(useCaseError);
        expect(result).toEqual(expectedErrorResponse);
      });

      it('should handle database connection errors', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const validatedData = { id: taskId };
        
        const databaseError = new Error(JSON.stringify({
          code: 'DATABASE_ERROR',
          message: 'Database connection failed',
          statusCode: 500
        }));
        (databaseError as any).statusCode = 500;

        const expectedErrorResponse = {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'DATABASE_ERROR',
            message: 'Database connection failed',
            statusCode: 500
          })
        };

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockRejectedValue(databaseError);
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, { dynamoManager: mockDynamoImpl });
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(databaseError);
        expect(result).toEqual(expectedErrorResponse);
      });

      it('should handle DynamoImpl instantiation errors', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const validatedData = { id: taskId };
        
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

        mockValidateSchema.mockReturnValue(validatedData);
        (DynamoImpl as jest.MockedClass<typeof DynamoImpl>).mockImplementation(() => {
          throw dynamoError;
        });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(dynamoError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });

      it('should handle generic errors', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const genericError = new Error('Generic error occurred');
        const expectedErrorResponse = {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
            statusCode: 500
          })
        };

        mockValidateSchema.mockImplementation(() => {
          throw genericError;
        });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(genericError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });
    });

    describe('Edge cases', () => {
      it('should handle empty string id', async () => {
        const event = {
          pathParameters: {
            id: ''
          }
        };

        const validationError = new Error(JSON.stringify({
          code: 'BAD_REQUEST',
          message: 'Invalid request: id cannot be empty',
          statusCode: 400
        }));
        (validationError as any).statusCode = 400;

        const expectedErrorResponse = {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'BAD_REQUEST',
            message: 'Invalid request: id cannot be empty',
            statusCode: 400
          })
        };

        mockValidateSchema.mockImplementation(() => {
          throw validationError;
        });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });

      it('should handle id with spaces', async () => {
        const event = {
          pathParameters: {
            id: '   123e4567-e89b-12d3-a456-426614174000   '
          }
        };

        const validationError = new Error(JSON.stringify({
          code: 'BAD_REQUEST',
          message: 'Invalid request: id format is invalid',
          statusCode: 400
        }));
        (validationError as any).statusCode = 400;

        const expectedErrorResponse = {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'BAD_REQUEST',
            message: 'Invalid request: id format is invalid',
            statusCode: 400
          })
        };

        mockValidateSchema.mockImplementation(() => {
          throw validationError;
        });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });

      it('should handle malformed UUID', async () => {
        const event = {
          pathParameters: {
            id: '123-456-789'
          }
        };

        const validationError = new Error(JSON.stringify({
          code: 'BAD_REQUEST',
          message: 'Invalid request: id must be a valid UUID format',
          statusCode: 400
        }));
        (validationError as any).statusCode = 400;

        const expectedErrorResponse = {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'BAD_REQUEST',
            message: 'Invalid request: id must be a valid UUID format',
            statusCode: 400
          })
        };

        mockValidateSchema.mockImplementation(() => {
          throw validationError;
        });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });

      it('should handle use case timeout error', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const validatedData = { id: taskId };
        
        const timeoutError = new Error('Request timeout');
        timeoutError.name = 'TimeoutError';
        const expectedErrorResponse = {
          statusCode: 408,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'TIMEOUT',
            message: 'Request timeout',
            statusCode: 408
          })
        };

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockRejectedValue(timeoutError);
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        const result = await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(event.pathParameters, getByIdSchema);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, { dynamoManager: mockDynamoImpl });
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(timeoutError);
        expect(result).toEqual(expectedErrorResponse);
      });
    });

    describe('Dependencies injection', () => {
      it('should correctly inject DynamoImpl instance to use case', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const validatedData = { id: taskId };

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockResolvedValue({ success: true });
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true })
        });

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith(taskId, {
          dynamoManager: mockDynamoImpl
        });
      });

      it('should create a new DynamoImpl instance for each request', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const validatedData = { id: taskId };

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockResolvedValue({ success: true });
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true })
        });

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        await adapter(event);
        await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(2);
      });

      it('should pass exact id from validation to use case', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const validatedData = { id: taskId };

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockResolvedValue({ success: true });
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true })
        });

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        await adapter(event);

        expect(mockUseCase).toHaveBeenCalledWith(taskId, {
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
          }
        };

        const validatedData = { id: taskId };
        const useCaseResult = { success: true, data: { task_id: taskId } };

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        });

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        await adapter(event);

        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(mockBuildResponseForLambda).toHaveBeenCalledTimes(1);
      });

      it('should always use buildErrorForLambda for error responses', async () => {
        const event = {
          pathParameters: {
            id: 'invalid-id'
          }
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

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        await adapter(event);

        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
        expect(mockBuildErrorForLambda).toHaveBeenCalledTimes(1);
      });
    });

    describe('Integration with validation schema', () => {
      it('should always call validateSchema with correct parameters', async () => {
        const taskId = '123e4567-e89b-12d3-a456-426614174000';
        const pathParameters = { id: taskId };
        const event = { pathParameters };

        const validatedData = { id: taskId };

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockResolvedValue({ success: true });
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true })
        });

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        await adapter(event);

        expect(mockValidateSchema).toHaveBeenCalledWith(pathParameters, getByIdSchema);
        expect(mockValidateSchema).toHaveBeenCalledTimes(1);
      });

      it('should extract id from validation result correctly', async () => {
        const taskId = '999e4567-e89b-12d3-a456-426614174999';
        const event = {
          pathParameters: {
            id: taskId
          }
        };

        const validatedData = { id: taskId };

        mockValidateSchema.mockReturnValue(validatedData);
        mockUseCase.mockResolvedValue({ success: true });
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true })
        });

        const adapter = getApiGatewayAdapterGetTaskByIdHttp(mockUseCase);
        await adapter(event);

        expect(mockUseCase).toHaveBeenCalledWith(taskId, {
          dynamoManager: mockDynamoImpl
        });
      });
    });
  });
});
