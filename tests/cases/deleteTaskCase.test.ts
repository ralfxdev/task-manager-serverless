import { deleteTaskHttp, TypeCaseUseDeleteTaskHttp } from '../../src/cases/deleteTaskCase';
import { DependenciesType } from '../../src/domain/common';
import * as responseHandler from '../../src/utils/http/response-handler';

jest.mock('../../src/utils/http/response-handler', () => ({
  success: jest.fn(),
}));

describe('DeleteTaskCase', () => {
  let mockDynamoManager: jest.Mocked<any>;
  let dependencies: DependenciesType;
  let deleteTaskUseCase: TypeCaseUseDeleteTaskHttp;

  beforeEach(() => {
    mockDynamoManager = {
      delete: jest.fn(),
    };

    dependencies = {
      dynamoManager: mockDynamoManager,
    };

    deleteTaskUseCase = deleteTaskHttp();
    jest.clearAllMocks();
  });

  describe('deleteTaskHttp', () => {
    it('should return a function when called', () => {
      const result = deleteTaskHttp();
      expect(typeof result).toBe('function');
    });

    it('should successfully delete a task and return success response', async () => {
      const taskId = '123';
      const deletedTask = {
        task_id: '123',
        title: 'Deleted Task',
        description: 'Task to be deleted',
        status: 'completed',
        tags: ['test'],
        is_high_priority: false,
        created_at: '2025-07-06T10:00:00Z',
        updated_at: '2025-07-06T11:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: deletedTask,
      };

      mockDynamoManager.delete.mockResolvedValue(deletedTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await deleteTaskUseCase(taskId, dependencies);

      expect(mockDynamoManager.delete).toHaveBeenCalledWith(taskId);
      expect(mockDynamoManager.delete).toHaveBeenCalledTimes(1);
      expect(responseHandler.success).toHaveBeenCalledWith('', deletedTask);
      expect(responseHandler.success).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle deletion with empty string ID', async () => {
      const taskId = '';
      const deletedTask = null;

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: deletedTask,
      };

      mockDynamoManager.delete.mockResolvedValue(deletedTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await deleteTaskUseCase(taskId, dependencies);

      expect(mockDynamoManager.delete).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle deletion when task does not exist', async () => {
      const taskId = 'non-existent-id';
      const deletedTask = null;

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: deletedTask,
      };

      mockDynamoManager.delete.mockResolvedValue(deletedTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await deleteTaskUseCase(taskId, dependencies);

      expect(mockDynamoManager.delete).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when dynamoManager.delete fails', async () => {
      const taskId = '123';
      const error = new Error('Database error');
      mockDynamoManager.delete.mockRejectedValue(error);

      await expect(deleteTaskUseCase(taskId, dependencies)).rejects.toThrow('Database error');
      expect(mockDynamoManager.delete).toHaveBeenCalledWith(taskId);
      expect(responseHandler.success).not.toHaveBeenCalled();
    });

    it('should throw error when dynamoManager.delete throws generic error', async () => {
      const taskId = '123';
      const error = new Error('Unexpected error');
      mockDynamoManager.delete.mockRejectedValue(error);

      await expect(deleteTaskUseCase(taskId, dependencies)).rejects.toThrow(error);
      expect(mockDynamoManager.delete).toHaveBeenCalledWith(taskId);
    });

    it('should handle deletion with special characters in ID', async () => {
      const taskId = 'task-123_special@chars';
      const deletedTask = {
        task_id: taskId,
        title: 'Special Task',
        description: 'Task with special ID',
        status: 'pending',
        tags: [],
        is_high_priority: true,
        created_at: '2025-07-06T10:00:00Z',
      };

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: deletedTask,
      };

      mockDynamoManager.delete.mockResolvedValue(deletedTask);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await deleteTaskUseCase(taskId, dependencies);

      expect(mockDynamoManager.delete).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(expectedResponse);
    });
  });
});
