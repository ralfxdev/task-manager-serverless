import { getApiGatewayAdapterCreateTaskHttp } from '../../../../../src/infrastructure/driving/aws/api-gateway/createTaskAdapter';
import { TypeCaseUseCreateTaskHttp } from '../../../../../src/cases/createTaskCase';
import { CreateTaskDto } from '../../../../../src/domain/Task';
import { DependenciesType } from '../../../../../src/domain/common';

jest.mock('../../../../../src/utils/response', () => ({
  buildErrorForLambda: jest.fn(),
  buildResponseCreatedForLambda: jest.fn(),
}));

jest.mock('../../../../../src/utils/validationSchemas', () => ({
  createTaskSchema: {},
  validateSchema: jest.fn(),
}));

jest.mock('../../../../../src/infrastructure/driven/dynamoManager/DynamoImplementation', () => ({
  DynamoImpl: jest.fn(),
}));

import { buildErrorForLambda, buildResponseCreatedForLambda } from '../../../../../src/utils/response';
import { createTaskSchema, validateSchema } from '../../../../../src/utils/validationSchemas';
import { DynamoImpl } from '../../../../../src/infrastructure/driven/dynamoManager/DynamoImplementation';

describe('createTaskAdapter', () => {
  let mockUseCase: jest.MockedFunction<TypeCaseUseCreateTaskHttp>;
  let mockDynamoImpl: jest.Mocked<DynamoImpl>;
  let mockValidateSchema: jest.MockedFunction<typeof validateSchema>;
  let mockBuildResponseCreatedForLambda: jest.MockedFunction<typeof buildResponseCreatedForLambda>;
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

    (DynamoImpl as jest.Mock).mockImplementation(() => mockDynamoImpl);

    mockValidateSchema = validateSchema as jest.MockedFunction<typeof validateSchema>;
    mockBuildResponseCreatedForLambda = buildResponseCreatedForLambda as jest.MockedFunction<typeof buildResponseCreatedForLambda>;
    mockBuildErrorForLambda = buildErrorForLambda as jest.MockedFunction<typeof buildErrorForLambda>;
  });

  describe('getApiGatewayAdapterCreateTaskHttp', () => {
    it('should successfully create a task and return created response', async () => {
      const eventBody = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        tags: ['test'],
        is_high_priority: false
      };

      const event = {
        body: JSON.stringify(eventBody)
      };

      const validatedData: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        tags: ['test'],
        is_high_priority: false
      };

      const expectedTask = {
        task_id: 'test-uuid-123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        tags: ['test'],
        is_high_priority: false,
        created_at: '2025-07-06T10:00:00.000Z',
        updated_at: '2025-07-06T10:00:00.000Z'
      };

      const expectedResponse = {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expectedTask)
      };

      mockValidateSchema.mockReturnValue(validatedData);
      mockUseCase.mockResolvedValue(expectedTask);
      mockBuildResponseCreatedForLambda.mockReturnValue(expectedResponse);

      const adapter = getApiGatewayAdapterCreateTaskHttp(mockUseCase);
      const result = await adapter(event);

      expect(mockValidateSchema).toHaveBeenCalledWith(eventBody, createTaskSchema);
      expect(DynamoImpl).toHaveBeenCalledTimes(1);
      expect(mockUseCase).toHaveBeenCalledWith(validatedData, {
        dynamoManager: mockDynamoImpl
      });
      expect(mockBuildResponseCreatedForLambda).toHaveBeenCalledWith(expectedTask);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle JSON.parse error and return error response', async () => {
      const event = {
        body: 'invalid json'
      };

      const expectedErrorResponse = {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal Server Error' })
      };

      mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

      const adapter = getApiGatewayAdapterCreateTaskHttp(mockUseCase);
      const result = await adapter(event);

      expect(mockBuildErrorForLambda).toHaveBeenCalledWith(expect.any(SyntaxError));
      expect(result).toEqual(expectedErrorResponse);
      expect(mockValidateSchema).not.toHaveBeenCalled();
      expect(mockUseCase).not.toHaveBeenCalled();
    });

    it('should handle validation error and return error response', async () => {
      const eventBody = {
        title: 'ab',
        description: 'Test Description'
      };

      const event = {
        body: JSON.stringify(eventBody)
      };

      const validationError = new Error('Validation failed: title must be at least 3 characters long');
      const expectedErrorResponse = {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Bad Request' })
      };

      mockValidateSchema.mockImplementation(() => {
        throw validationError;
      });
      mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

      const adapter = getApiGatewayAdapterCreateTaskHttp(mockUseCase);
      const result = await adapter(event);

      expect(mockValidateSchema).toHaveBeenCalledWith(eventBody, createTaskSchema);
      expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
      expect(result).toEqual(expectedErrorResponse);
      expect(mockUseCase).not.toHaveBeenCalled();
    });

    it('should handle use case error and return error response', async () => {
      const eventBody = {
        title: 'Test Task',
        description: 'Test Description'
      };

      const event = {
        body: JSON.stringify(eventBody)
      };

      const validatedData: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description'
      };

      const useCaseError = new Error('Database connection failed');
      const expectedErrorResponse = {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal Server Error' })
      };

      mockValidateSchema.mockReturnValue(validatedData);
      mockUseCase.mockRejectedValue(useCaseError);
      mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

      const adapter = getApiGatewayAdapterCreateTaskHttp(mockUseCase);
      const result = await adapter(event);

      expect(mockValidateSchema).toHaveBeenCalledWith(eventBody, createTaskSchema);
      expect(DynamoImpl).toHaveBeenCalledTimes(1);
      expect(mockUseCase).toHaveBeenCalledWith(validatedData, {
        dynamoManager: mockDynamoImpl
      });
      expect(mockBuildErrorForLambda).toHaveBeenCalledWith(useCaseError);
      expect(result).toEqual(expectedErrorResponse);
    });

    it('should create DynamoImpl instance and pass it to dependencies', async () => {
      const eventBody = {
        title: 'Test Task',
        description: 'Test Description'
      };

      const event = {
        body: JSON.stringify(eventBody)
      };

      const validatedData: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description'
      };

      const expectedTask = {
        task_id: 'test-uuid-123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        tags: [],
        is_high_priority: false,
        created_at: '2025-07-06T10:00:00.000Z',
        updated_at: '2025-07-06T10:00:00.000Z'
      };

      mockValidateSchema.mockReturnValue(validatedData);
      mockUseCase.mockResolvedValue(expectedTask);
      mockBuildResponseCreatedForLambda.mockReturnValue({} as any);

      const adapter = getApiGatewayAdapterCreateTaskHttp(mockUseCase);
      await adapter(event);

      expect(DynamoImpl).toHaveBeenCalledTimes(1);
      expect(mockUseCase).toHaveBeenCalledWith(validatedData, {
        dynamoManager: expect.any(Object)
      });

      const useCaseCall = mockUseCase.mock.calls[0];
      const dependencies = useCaseCall[1] as DependenciesType;
      expect(dependencies).toHaveProperty('dynamoManager');
      expect(dependencies.dynamoManager).toBe(mockDynamoImpl);
    });

    it('should handle complex task data with all optional fields', async () => {
      const eventBody = {
        title: 'Complex Test Task',
        description: 'Complex Test Description',
        status: 'in-progress',
        tags: ['urgent', 'testing', 'complex'],
        due_date: '2025-07-15T10:00:00.000Z',
        estimated_time: 120,
        is_high_priority: true
      };

      const event = {
        body: JSON.stringify(eventBody)
      };

      const validatedData: CreateTaskDto = {
        title: 'Complex Test Task',
        description: 'Complex Test Description',
        status: 'in-progress',
        tags: ['urgent', 'testing', 'complex'],
        due_date: '2025-07-15T10:00:00.000Z',
        estimated_time: 120,
        is_high_priority: true
      };

      const expectedTask = {
        task_id: 'test-uuid-456',
        ...validatedData,
        created_at: '2025-07-06T10:00:00.000Z',
        updated_at: '2025-07-06T10:00:00.000Z'
      };

      const expectedResponse = {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expectedTask)
      };

      mockValidateSchema.mockReturnValue(validatedData);
      mockUseCase.mockResolvedValue(expectedTask);
      mockBuildResponseCreatedForLambda.mockReturnValue(expectedResponse);

      const adapter = getApiGatewayAdapterCreateTaskHttp(mockUseCase);
      const result = await adapter(event);

      expect(mockValidateSchema).toHaveBeenCalledWith(eventBody, createTaskSchema);
      expect(mockUseCase).toHaveBeenCalledWith(validatedData, {
        dynamoManager: mockDynamoImpl
      });
      expect(mockBuildResponseCreatedForLambda).toHaveBeenCalledWith(expectedTask);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle event with null body', async () => {
      const event = {
        body: null
      };

      const validationError = new Error('Validation failed: null is not a valid object');
      const expectedErrorResponse = {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal Server Error' })
      };

      mockValidateSchema.mockImplementation(() => {
        throw validationError;
      });
      mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

      const adapter = getApiGatewayAdapterCreateTaskHttp(mockUseCase);
      const result = await adapter(event);

      expect(mockValidateSchema).toHaveBeenCalledWith(null, createTaskSchema);
      expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
      expect(result).toEqual(expectedErrorResponse);
      expect(mockUseCase).not.toHaveBeenCalled();
    });

    it('should handle event with empty string body', async () => {
      const event = {
        body: ''
      };

      const expectedErrorResponse = {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal Server Error' })
      };

      mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

      const adapter = getApiGatewayAdapterCreateTaskHttp(mockUseCase);
      const result = await adapter(event);

      expect(mockBuildErrorForLambda).toHaveBeenCalledWith(expect.any(SyntaxError));
      expect(result).toEqual(expectedErrorResponse);
      expect(mockValidateSchema).not.toHaveBeenCalled();
      expect(mockUseCase).not.toHaveBeenCalled();
    });

    it('should handle different validation errors', async () => {
      const eventBody = {
      };

      const event = {
        body: JSON.stringify(eventBody)
      };

      const validationError = new Error('Validation failed: title is required');
      const expectedErrorResponse = {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Bad Request' })
      };

      mockValidateSchema.mockImplementation(() => {
        throw validationError;
      });
      mockBuildErrorForLambda.mockReturnValue(expectedErrorResponse);

      const adapter = getApiGatewayAdapterCreateTaskHttp(mockUseCase);
      const result = await adapter(event);

      expect(mockValidateSchema).toHaveBeenCalledWith(eventBody, createTaskSchema);
      expect(mockBuildErrorForLambda).toHaveBeenCalledWith(validationError);
      expect(result).toEqual(expectedErrorResponse);
    });

    it('should pass the correct createTaskSchema to validation', async () => {
      const eventBody = {
        title: 'Test Task',
        description: 'Test Description'
      };

      const event = {
        body: JSON.stringify(eventBody)
      };

      const validatedData: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description'
      };

      mockValidateSchema.mockReturnValue(validatedData);
      mockUseCase.mockResolvedValue({} as any);
      mockBuildResponseCreatedForLambda.mockReturnValue({} as any);

      const adapter = getApiGatewayAdapterCreateTaskHttp(mockUseCase);
      await adapter(event);

      expect(mockValidateSchema).toHaveBeenCalledWith(eventBody, createTaskSchema);
      expect(mockValidateSchema).toHaveBeenCalledTimes(1);
    });
  });
});
