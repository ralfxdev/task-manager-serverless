import { updateTaskHttp, TypeCaseUseUpdateTaskHttp } from '../../src/cases/updateTaskCase';
import { UpdateTaskDto } from '../../src/domain/Task';
import { DependenciesType } from '../../src/domain/common';
import * as responseHandler from '../../src/utils/http/response-handler';

jest.mock('../../src/utils/http/response-handler', () => ({
  success: jest.fn(),
}));

describe('UpdateTaskCase', () => {
  let mockDynamoManager: jest.Mocked<any>;
  let dependencies: DependenciesType;
  let updateTaskUseCase: TypeCaseUseUpdateTaskHttp;

  beforeEach(() => {
    mockDynamoManager = {
      update: jest.fn(),
    };

    dependencies = {
      dynamoManager: mockDynamoManager,
    };

    updateTaskUseCase = updateTaskHttp();
    jest.clearAllMocks();
  });

  describe('updateTaskHttp', () => {
    it('should return a function when called', () => {
      const result = updateTaskHttp();
      expect(typeof result).toBe('function');
    });

    it('should successfully update a task and return success response', async () => {
      const taskId = '123';
      const taskData: UpdateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'in_progress',
        tags: ['updated', 'test'],
        due_date: '2025-07-20',
        estimated_time: 150,
        is_high_priority: false,
      };

      const updatedTask = {
        task_id: '123',
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'in_progress',
        tags: ['updated', 'test'],
        due_date: '2025-07-20',
        estimated_time: 150,
        is_high_priority: false,
        created_at: '2025-07-06T10:00:00Z',
        updated_at: '2025-07-06T11:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: updatedTask,
      };

      mockDynamoManager.update.mockResolvedValue(updatedTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await updateTaskUseCase(taskId, taskData, dependencies);

      expect(mockDynamoManager.update).toHaveBeenCalledWith(taskId, taskData);
      expect(mockDynamoManager.update).toHaveBeenCalledTimes(1);
      expect(responseHandler.success).toHaveBeenCalledWith('', updatedTask);
      expect(responseHandler.success).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle partial update (only title)', async () => {
      const taskId = '456';
      const taskData: UpdateTaskDto = {
        title: 'New Title Only',
      };

      const updatedTask = {
        task_id: '456',
        title: 'New Title Only',
        description: 'Original Description',
        status: 'pending',
        tags: ['original'],
        is_high_priority: true,
        created_at: '2025-07-06T10:00:00Z',
        updated_at: '2025-07-06T11:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: updatedTask,
      };

      mockDynamoManager.update.mockResolvedValue(updatedTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await updateTaskUseCase(taskId, taskData, dependencies);

      expect(mockDynamoManager.update).toHaveBeenCalledWith(taskId, taskData);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle partial update (only description)', async () => {
      const taskId = '789';
      const taskData: UpdateTaskDto = {
        description: 'New Description Only',
      };

      const updatedTask = {
        task_id: '789',
        title: 'Original Title',
        description: 'New Description Only',
        status: 'pending',
        tags: [],
        is_high_priority: false,
        created_at: '2025-07-06T10:00:00Z',
        updated_at: '2025-07-06T11:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: updatedTask,
      };

      mockDynamoManager.update.mockResolvedValue(updatedTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await updateTaskUseCase(taskId, taskData, dependencies);

      expect(mockDynamoManager.update).toHaveBeenCalledWith(taskId, taskData);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle partial update (only status)', async () => {
      const taskId = '101';
      const taskData: UpdateTaskDto = {
        status: 'completed',
      };

      const updatedTask = {
        task_id: '101',
        title: 'Original Title',
        description: 'Original Description',
        status: 'completed',
        tags: ['work'],
        is_high_priority: true,
        created_at: '2025-07-06T10:00:00Z',
        updated_at: '2025-07-06T11:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: updatedTask,
      };

      mockDynamoManager.update.mockResolvedValue(updatedTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await updateTaskUseCase(taskId, taskData, dependencies);

      expect(mockDynamoManager.update).toHaveBeenCalledWith(taskId, taskData);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle update with empty tags array', async () => {
      const taskId = '111';
      const taskData: UpdateTaskDto = {
        tags: [],
      };

      const updatedTask = {
        task_id: '111',
        title: 'Original Title',
        description: 'Original Description',
        status: 'pending',
        tags: [],
        is_high_priority: false,
        created_at: '2025-07-06T10:00:00Z',
        updated_at: '2025-07-06T11:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: updatedTask,
      };

      mockDynamoManager.update.mockResolvedValue(updatedTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await updateTaskUseCase(taskId, taskData, dependencies);

      expect(mockDynamoManager.update).toHaveBeenCalledWith(taskId, taskData);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle update with undefined fields', async () => {
      const taskId = '222';
      const taskData: UpdateTaskDto = {
        title: undefined,
        description: undefined,
        status: undefined,
        tags: undefined,
        due_date: undefined,
        estimated_time: undefined,
        is_high_priority: undefined,
      };

      const updatedTask = {
        task_id: '222',
        title: 'Original Title',
        description: 'Original Description',
        status: 'pending',
        tags: ['original'],
        is_high_priority: true,
        created_at: '2025-07-06T10:00:00Z',
        updated_at: '2025-07-06T11:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: updatedTask,
      };

      mockDynamoManager.update.mockResolvedValue(updatedTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await updateTaskUseCase(taskId, taskData, dependencies);

      expect(mockDynamoManager.update).toHaveBeenCalledWith(taskId, taskData);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle update with estimated_time as 0', async () => {
      const taskId = '333';
      const taskData: UpdateTaskDto = {
        estimated_time: 0,
      };

      const updatedTask = {
        task_id: '333',
        title: 'Original Title',
        description: 'Original Description',
        status: 'pending',
        tags: [],
        estimated_time: 0,
        is_high_priority: false,
        created_at: '2025-07-06T10:00:00Z',
        updated_at: '2025-07-06T11:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: updatedTask,
      };

      mockDynamoManager.update.mockResolvedValue(updatedTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await updateTaskUseCase(taskId, taskData, dependencies);

      expect(mockDynamoManager.update).toHaveBeenCalledWith(taskId, taskData);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle empty string task ID', async () => {
      const taskId = '';
      const taskData: UpdateTaskDto = {
        title: 'Updated Title',
      };

      const updatedTask = null;

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: updatedTask,
      };

      mockDynamoManager.update.mockResolvedValue(updatedTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await updateTaskUseCase(taskId, taskData, dependencies);

      expect(mockDynamoManager.update).toHaveBeenCalledWith(taskId, taskData);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle special characters in task ID', async () => {
      const taskId = 'task-123_special@chars';
      const taskData: UpdateTaskDto = {
        title: 'Updated Special Task',
      };

      const updatedTask = {
        task_id: taskId,
        title: 'Updated Special Task',
        description: 'Original Description',
        status: 'pending',
        tags: ['special'],
        is_high_priority: true,
        created_at: '2025-07-06T10:00:00Z',
        updated_at: '2025-07-06T11:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: updatedTask,
      };

      mockDynamoManager.update.mockResolvedValue(updatedTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await updateTaskUseCase(taskId, taskData, dependencies);

      expect(mockDynamoManager.update).toHaveBeenCalledWith(taskId, taskData);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when dynamoManager.update fails', async () => {
      const taskId = '123';
      const taskData: UpdateTaskDto = {
        title: 'Updated Task',
      };

      const error = new Error('Database error');
      mockDynamoManager.update.mockRejectedValue(error);

      await expect(updateTaskUseCase(taskId, taskData, dependencies)).rejects.toThrow('Database error');
      expect(mockDynamoManager.update).toHaveBeenCalledWith(taskId, taskData);
      expect(responseHandler.success).not.toHaveBeenCalled();
    });

    it('should throw error when dynamoManager.update throws generic error', async () => {
      const taskId = '123';
      const taskData: UpdateTaskDto = {
        title: 'Updated Task',
      };

      const error = new Error('Unexpected error');
      mockDynamoManager.update.mockRejectedValue(error);

      await expect(updateTaskUseCase(taskId, taskData, dependencies)).rejects.toThrow(error);
      expect(mockDynamoManager.update).toHaveBeenCalledWith(taskId, taskData);
    });
  });
});
