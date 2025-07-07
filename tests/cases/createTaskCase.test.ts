import { createTaskHttp, TypeCaseUseCreateTaskHttp } from '../../src/cases/createTaskCase';
import { CreateTaskDto } from '../../src/domain/Task';
import { DependenciesType } from '../../src/domain/common';
import * as responseHandler from '../../src/utils/http/response-handler';

jest.mock('../../src/utils/http/response-handler', () => ({
  success: jest.fn(),
}));

describe('CreateTaskCase', () => {
  let mockDynamoManager: jest.Mocked<any>;
  let dependencies: DependenciesType;
  let createTaskUseCase: TypeCaseUseCreateTaskHttp;

  beforeEach(() => {
    mockDynamoManager = {
      create: jest.fn(),
    };

    dependencies = {
      dynamoManager: mockDynamoManager,
    };

    createTaskUseCase = createTaskHttp();
    jest.clearAllMocks();
  });

  describe('createTaskHttp', () => {
    it('should return a function when called', () => {
      const result = createTaskHttp();
      expect(typeof result).toBe('function');
    });

    it('should successfully create a task and return success response', async () => {
      const taskData: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        tags: ['test'],
        due_date: '2025-07-15',
        estimated_time: 120,
        is_high_priority: true,
      };

      const createdTask = {
        task_id: '123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        tags: ['test'],
        due_date: '2025-07-15',
        estimated_time: 120,
        is_high_priority: true,
        created_at: '2025-07-06T10:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: createdTask,
      };

      mockDynamoManager.create.mockResolvedValue(createdTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await createTaskUseCase(taskData, dependencies);

      expect(mockDynamoManager.create).toHaveBeenCalledWith(taskData);
      expect(mockDynamoManager.create).toHaveBeenCalledTimes(1);
      expect(responseHandler.success).toHaveBeenCalledWith('', createdTask);
      expect(responseHandler.success).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle minimal task data', async () => {
      const taskData: CreateTaskDto = {
        title: 'Minimal Task',
        description: 'Minimal Description',
      };

      const createdTask = {
        task_id: '456',
        title: 'Minimal Task',
        description: 'Minimal Description',
        status: 'pending',
        tags: [],
        is_high_priority: false,
        created_at: '2025-07-06T10:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: createdTask,
      };

      mockDynamoManager.create.mockResolvedValue(createdTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await createTaskUseCase(taskData, dependencies);

      expect(mockDynamoManager.create).toHaveBeenCalledWith(taskData);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when dynamoManager.create fails', async () => {
      const taskData: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
      };

      const error = new Error('Database error');
      mockDynamoManager.create.mockRejectedValue(error);

      await expect(createTaskUseCase(taskData, dependencies)).rejects.toThrow('Database error');
      expect(mockDynamoManager.create).toHaveBeenCalledWith(taskData);
      expect(responseHandler.success).not.toHaveBeenCalled();
    });

    it('should throw error when dynamoManager.create throws generic error', async () => {
      const taskData: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
      };

      const error = new Error('Unexpected error');
      mockDynamoManager.create.mockRejectedValue(error);

      await expect(createTaskUseCase(taskData, dependencies)).rejects.toThrow(error);
      expect(mockDynamoManager.create).toHaveBeenCalledWith(taskData);
    });

    it('should handle undefined optional fields in taskData', async () => {
      const taskData: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: undefined,
        tags: undefined,
        due_date: undefined,
        estimated_time: undefined,
        is_high_priority: undefined,
      };

      const createdTask = {
        task_id: '789',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        tags: [],
        is_high_priority: false,
        created_at: '2025-07-06T10:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: createdTask,
      };

      mockDynamoManager.create.mockResolvedValue(createdTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await createTaskUseCase(taskData, dependencies);

      expect(mockDynamoManager.create).toHaveBeenCalledWith(taskData);
      expect(result).toEqual(expectedResponse);
    });
  });
});
