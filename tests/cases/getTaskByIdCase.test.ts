import { getTaskByIdHttp, TypeCaseUseGetTaskByIdHttp } from '../../src/cases/getTaskByIdCase';
import { DependenciesType } from '../../src/domain/common';
import * as responseHandler from '../../src/utils/http/response-handler';

jest.mock('../../src/utils/http/response-handler', () => ({
  success: jest.fn(),
}));

describe('GetTaskByIdCase', () => {
  let mockDynamoManager: jest.Mocked<any>;
  let dependencies: DependenciesType;
  let getTaskByIdUseCase: TypeCaseUseGetTaskByIdHttp;

  beforeEach(() => {
    mockDynamoManager = {
      findById: jest.fn(),
    };

    dependencies = {
      dynamoManager: mockDynamoManager,
    };

    getTaskByIdUseCase = getTaskByIdHttp();
    jest.clearAllMocks();
  });

  describe('getTaskByIdHttp', () => {
    it('should return a function when called', () => {
      const result = getTaskByIdHttp();
      expect(typeof result).toBe('function');
    });

    it('should successfully get a task by ID and return success response', async () => {
      const taskId = '123';
      const task = {
        task_id: '123',
        title: 'Found Task',
        description: 'Task found by ID',
        status: 'pending',
        tags: ['work'],
        is_high_priority: true,
        created_at: '2025-07-06T10:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: task,
      };

      mockDynamoManager.findById.mockResolvedValue(task);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await getTaskByIdUseCase(taskId, dependencies);

      expect(mockDynamoManager.findById).toHaveBeenCalledWith(taskId);
      expect(mockDynamoManager.findById).toHaveBeenCalledTimes(1);
      expect(responseHandler.success).toHaveBeenCalledWith('', task);
      expect(responseHandler.success).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle task with all optional fields', async () => {
      const taskId = '456';
      const task = {
        task_id: '456',
        title: 'Complete Task',
        description: 'Task with all fields',
        status: 'completed',
        tags: ['work', 'urgent', 'meeting'],
        due_date: '2025-07-15T14:30:00Z',
        estimated_time: 180,
        is_high_priority: true,
        created_at: '2025-07-06T10:00:00Z',
        updated_at: '2025-07-06T12:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: task,
      };

      mockDynamoManager.findById.mockResolvedValue(task);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await getTaskByIdUseCase(taskId, dependencies);

      expect(mockDynamoManager.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle task with minimal fields', async () => {
      const taskId = '789';
      const task = {
        task_id: '789',
        title: 'Minimal Task',
        description: 'Basic task',
        status: 'pending',
        tags: [],
        is_high_priority: false,
        created_at: '2025-07-06T10:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: task,
      };

      mockDynamoManager.findById.mockResolvedValue(task);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await getTaskByIdUseCase(taskId, dependencies);

      expect(mockDynamoManager.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle when task is not found (returns null)', async () => {
      const taskId = 'non-existent-id';

      mockDynamoManager.findById.mockResolvedValue(null);

      await expect(getTaskByIdUseCase(taskId, dependencies)).rejects.toThrow();
      expect(mockDynamoManager.findById).toHaveBeenCalledWith(taskId);
    });

    it('should handle empty string ID', async () => {
      const taskId = '';

      mockDynamoManager.findById.mockResolvedValue(null);

      await expect(getTaskByIdUseCase(taskId, dependencies)).rejects.toThrow();
      expect(mockDynamoManager.findById).toHaveBeenCalledWith(taskId);
    });

    it('should handle special characters in ID', async () => {
      const taskId = 'task-123_special@chars';
      const task = {
        task_id: taskId,
        title: 'Special Task',
        description: 'Task with special ID',
        status: 'in_progress',
        tags: ['special'],
        is_high_priority: true,
        created_at: '2025-07-06T10:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: task,
      };

      mockDynamoManager.findById.mockResolvedValue(task);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await getTaskByIdUseCase(taskId, dependencies);

      expect(mockDynamoManager.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when dynamoManager.findById fails', async () => {
      const taskId = '123';
      const error = new Error('Database error');
      mockDynamoManager.findById.mockRejectedValue(error);

      await expect(getTaskByIdUseCase(taskId, dependencies)).rejects.toThrow('Database error');
      expect(mockDynamoManager.findById).toHaveBeenCalledWith(taskId);
      expect(responseHandler.success).not.toHaveBeenCalled();
    });

    it('should throw error when dynamoManager.findById throws generic error', async () => {
      const taskId = '123';
      const error = new Error('Unexpected error');
      mockDynamoManager.findById.mockRejectedValue(error);

      await expect(getTaskByIdUseCase(taskId, dependencies)).rejects.toThrow(error);
      expect(mockDynamoManager.findById).toHaveBeenCalledWith(taskId);
    });
  });
});
