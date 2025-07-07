import { getApiGatewayAdapterGetAllTaskHttp } from '../../../../../src/infrastructure/driving/aws/api-gateway/getAllTaskAdapter';
import { TypeCaseUseGetAllTaskHttp } from '../../../../../src/cases/getAllTaskCase';
import { DynamoImpl } from '../../../../../src/infrastructure/driven/dynamoManager/DynamoImplementation';
import { buildErrorForLambda, buildResponseForLambda } from '../../../../../src/utils/response';

jest.mock('http-errors', () => jest.fn());

jest.mock('../../../../../src/infrastructure/driven/dynamoManager/DynamoImplementation');
jest.mock('../../../../../src/utils/response');

describe('getAllTaskAdapter', () => {
  let mockUseCase: jest.MockedFunction<TypeCaseUseGetAllTaskHttp>;
  let mockDynamoImpl: jest.Mocked<DynamoImpl>;
  let mockBuildResponseForLambda: jest.MockedFunction<typeof buildResponseForLambda>;
  let mockBuildErrorForLambda: jest.MockedFunction<typeof buildErrorForLambda>;

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

    (DynamoImpl as jest.MockedClass<typeof DynamoImpl>).mockImplementation(() => mockDynamoImpl);
  });

  describe('getApiGatewayAdapterGetAllTaskHttp', () => {
    describe('Success scenarios', () => {
      it('should successfully retrieve all tasks', async () => {
        const event = {};
        
        const useCaseResult = {
          success: true,
          message: 'Tasks retrieved successfully',
          data: [
            {
              task_id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Task 1',
              description: 'Description 1',
              status: 'pending',
              tags: ['work'],
              is_high_priority: false,
              created_at: '2024-01-01T00:00:00.000Z'
            },
            {
              task_id: '456e7890-e12b-34c5-d678-426614174001',
              title: 'Task 2',
              description: 'Description 2',
              status: 'completed',
              tags: ['personal'],
              is_high_priority: true,
              created_at: '2024-01-02T00:00:00.000Z'
            }
          ]
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle empty task list', async () => {
        const event = {};
        
        const useCaseResult = {
          success: true,
          message: 'No tasks found',
          data: []
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle single task in list', async () => {
        const event = {};
        
        const useCaseResult = {
          success: true,
          message: 'Tasks retrieved successfully',
          data: [
            {
              task_id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Single Task',
              description: 'Single task description',
              status: 'in-progress',
              tags: ['urgent'],
              is_high_priority: true,
              created_at: '2024-01-01T00:00:00.000Z'
            }
          ]
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle use case returning null', async () => {
        const event = {};
        
        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(null)
        };

        mockUseCase.mockResolvedValue(null);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(null);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle use case returning undefined', async () => {
        const event = {};
        
        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(undefined)
        };

        mockUseCase.mockResolvedValue(undefined);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(undefined);
        expect(result).toEqual(expectedResponse);
      });
    });

    describe('Error handling scenarios', () => {
      it('should handle use case errors', async () => {

        const event = {};
        
        const useCaseError = new Error(JSON.stringify({
          code: 'DYNAMO_ERROR',
          message: 'Database connection failed',
          statusCode: 500
        }));
        (useCaseError as any).statusCode = 500;

        const expectedErrorResponse = {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'DYNAMO_ERROR',
            message: 'Database connection failed',
            statusCode: 500
          })
        };

        mockUseCase.mockRejectedValue(useCaseError);
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ dynamoManager: mockDynamoImpl });
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(useCaseError);
        expect(result).toEqual(expectedErrorResponse);
      });

      it('should handle DynamoImpl instantiation errors', async () => {
        const event = {};
        
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

        (DynamoImpl as jest.MockedClass<typeof DynamoImpl>).mockImplementation(() => {
          throw dynamoError;
        });
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(dynamoError);
        expect(result).toEqual(expectedErrorResponse);
        expect(mockUseCase).not.toHaveBeenCalled();
      });

      it('should handle database connection timeout', async () => {
        const event = {};
        
        const timeoutError = new Error('Connection timeout');
        timeoutError.name = 'TimeoutError';
        const expectedErrorResponse = {
          statusCode: 408,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'TIMEOUT',
            message: 'Connection timeout',
            statusCode: 408
          })
        };

        mockUseCase.mockRejectedValue(timeoutError);
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ dynamoManager: mockDynamoImpl });
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(timeoutError);
        expect(result).toEqual(expectedErrorResponse);
      });

      it('should handle permission denied error', async () => {
        const event = {};
        
        const permissionError = new Error(JSON.stringify({
          code: 'ACCESS_DENIED',
          message: 'Insufficient permissions to access database',
          statusCode: 403
        }));
        (permissionError as any).statusCode = 403;

        const expectedErrorResponse = {
          statusCode: 403,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'ACCESS_DENIED',
            message: 'Insufficient permissions to access database',
            statusCode: 403
          })
        };

        mockUseCase.mockRejectedValue(permissionError);
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ dynamoManager: mockDynamoImpl });
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(permissionError);
        expect(result).toEqual(expectedErrorResponse);
      });

      it('should handle generic runtime error', async () => {
        const event = {};
        
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

        mockUseCase.mockRejectedValue(genericError);
        mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ dynamoManager: mockDynamoImpl });
        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(genericError);
        expect(result).toEqual(expectedErrorResponse);
      });
    });

    describe('Edge cases', () => {
      it('should handle large task datasets', async () => {
        const event = {};
        
        const largeTasks = Array.from({ length: 100 }, (_, index) => ({
          task_id: `task-${index}-uuid`,
          title: `Task ${index}`,
          description: `Description for task ${index}`,
          status: index % 3 === 0 ? 'pending' : index % 3 === 1 ? 'in-progress' : 'completed',
          tags: [`tag${index % 5}`],
          is_high_priority: index % 4 === 0,
          created_at: `2024-01-${String(index % 30 + 1).padStart(2, '0')}T00:00:00.000Z`
        }));

        const useCaseResult = {
          success: true,
          message: 'Tasks retrieved successfully',
          data: largeTasks
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle tasks with special characters', async () => {
        const event = {};
        
        const useCaseResult = {
          success: true,
          message: 'Tasks retrieved successfully',
          data: [
            {
              task_id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Task with "quotes" & special chars: áéíóú',
              description: 'Description with <HTML> tags & símbolos especiales',
              status: 'pending',
              tags: ['特殊字符', 'émojis😀', 'русский'],
              is_high_priority: false,
              created_at: '2024-01-01T00:00:00.000Z'
            }
          ]
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        const result = await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ dynamoManager: mockDynamoImpl });
        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(result).toEqual(expectedResponse);
      });

      it('should handle concurrent execution', async () => {
        const event = {};
        
        const useCaseResult = {
          success: true,
          message: 'Tasks retrieved successfully',
          data: [
            {
              task_id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Concurrent Task',
              description: 'Task retrieved during concurrent execution',
              status: 'pending',
              tags: ['concurrent'],
              is_high_priority: false,
              created_at: '2024-01-01T00:00:00.000Z'
            }
          ]
        };

        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        const promises = Array.from({ length: 5 }, () => adapter(event));
        const results = await Promise.all(promises);

        expect(DynamoImpl).toHaveBeenCalledTimes(5);
        expect(mockUseCase).toHaveBeenCalledTimes(5);
        results.forEach(result => {
          expect(result).toEqual(expectedResponse);
        });
      });
    });

    describe('Dependencies injection', () => {
      it('should correctly inject DynamoImpl instance to use case', async () => {
        const event = {};

        mockUseCase.mockResolvedValue({ success: true, data: [] });
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, data: [] })
        });

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({
          dynamoManager: mockDynamoImpl
        });
      });

      it('should create a new DynamoImpl instance for each request', async () => {
        const event = {};

        mockUseCase.mockResolvedValue({ success: true, data: [] });
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, data: [] })
        });

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        await adapter(event);
        await adapter(event);

        expect(DynamoImpl).toHaveBeenCalledTimes(2);
      });

      it('should pass dependencies object with correct structure', async () => {
        const event = {};

        mockUseCase.mockResolvedValue({ success: true, data: [] });
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, data: [] })
        });

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        await adapter(event);

        expect(mockUseCase).toHaveBeenCalledWith(
          expect.objectContaining({
            dynamoManager: expect.any(Object)
          })
        );
      });
    });

    describe('Response handling', () => {
      it('should always use buildResponseForLambda for success responses', async () => {
        const event = {};
        const useCaseResult = { success: true, data: [] };

        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue({
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        });

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        await adapter(event);

        expect(mockBuildResponseForLambda).toHaveBeenCalledWith(useCaseResult);
        expect(mockBuildResponseForLambda).toHaveBeenCalledTimes(1);
        expect(mockBuildErrorForLambda).not.toHaveBeenCalled();
      });

      it('should always use buildErrorForLambda for error responses', async () => {
        const event = {};
        const error = new Error('Test error');
        
        mockUseCase.mockRejectedValue(error);
        mockBuildErrorForLambda.mockReturnValue({
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Internal Server Error' })
        });

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        await adapter(event);

        expect(mockBuildErrorForLambda).toHaveBeenCalledWith(error);
        expect(mockBuildErrorForLambda).toHaveBeenCalledTimes(1);
        expect(mockBuildResponseForLambda).not.toHaveBeenCalled();
      });

      it('should handle different event object structures', async () => {
        const events = [
          {},
          { headers: { 'Content-Type': 'application/json' } },
          { queryStringParameters: { limit: '10' } },
          { pathParameters: { id: 'some-id' } },
          { body: JSON.stringify({ test: 'data' }) },
          null,
          undefined
        ];

        const useCaseResult = { success: true, data: [] };
        const expectedResponse = {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(useCaseResult)
        };

        mockUseCase.mockResolvedValue(useCaseResult);
        mockBuildResponseForLambda.mockReturnValue(expectedResponse);

        const adapter = getApiGatewayAdapterGetAllTaskHttp(mockUseCase);
        
        for (const event of events) {
          const result = await adapter(event);
          expect(result).toEqual(expectedResponse);
        }

        expect(DynamoImpl).toHaveBeenCalledTimes(events.length);
        expect(mockUseCase).toHaveBeenCalledTimes(events.length);
      });
    });
  });
});
