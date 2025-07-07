import { getAllTaskHttp, TypeCaseUseGetAllTaskHttp } from '../../src/cases/getAllTaskCase';
import { DependenciesType } from '../../src/domain/common';
import * as responseHandler from '../../src/utils/http/response-handler';

jest.mock('../../src/utils/http/response-handler', () => ({
  success: jest.fn(),
}));

describe('GetAllTaskCase', () => {
  let mockDynamoManager: jest.Mocked<any>;
  let dependencies: DependenciesType;
  let getAllTaskUseCase: TypeCaseUseGetAllTaskHttp;

  beforeEach(() => {
    mockDynamoManager = {
      findAll: jest.fn(),
    };

    dependencies = {
      dynamoManager: mockDynamoManager,
    };

    getAllTaskUseCase = getAllTaskHttp();
    jest.clearAllMocks();
  });

  describe('getAllTaskHttp', () => {
    it('should return a function when called', () => {
      const result = getAllTaskHttp();
      expect(typeof result).toBe('function');
    });

    it('should successfully get all tasks and return success response', async () => {
      const tasks = [
        {
          task_id: '123',
          title: 'Task 1',
          description: 'First task',
          status: 'pending',
          tags: ['work'],
          is_high_priority: true,
          created_at: '2025-07-06T10:00:00Z',
        },
        {
          task_id: '456',
          title: 'Task 2',
          description: 'Second task',
          status: 'completed',
          tags: ['personal'],
          is_high_priority: false,
          created_at: '2025-07-05T10:00:00Z',
          updated_at: '2025-07-06T10:00:00Z',
        },
      ];

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: tasks,
      };

      mockDynamoManager.findAll.mockResolvedValue(tasks);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await getAllTaskUseCase(dependencies);

      expect(mockDynamoManager.findAll).toHaveBeenCalledWith();
      expect(mockDynamoManager.findAll).toHaveBeenCalledTimes(1);
      expect(responseHandler.success).toHaveBeenCalledWith('', tasks);
      expect(responseHandler.success).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle empty task list', async () => {
      const tasks: any[] = [];

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: tasks,
      };

      mockDynamoManager.findAll.mockResolvedValue(tasks);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await getAllTaskUseCase(dependencies);

      expect(mockDynamoManager.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(expectedResponse);
    });

    it('should handle single task in list', async () => {
      const tasks = [
        {
          task_id: '789',
          title: 'Single Task',
          description: 'Only one task',
          status: 'in_progress',
          tags: ['urgent'],
          due_date: '2025-07-10',
          estimated_time: 60,
          is_high_priority: true,
          created_at: '2025-07-06T10:00:00Z',
        },
      ];

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: tasks,
      };

      mockDynamoManager.findAll.mockResolvedValue(tasks);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await getAllTaskUseCase(dependencies);

      expect(mockDynamoManager.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(expectedResponse);
    });

    it('should handle tasks with all optional fields', async () => {
      const tasks = [
        {
          task_id: '111',
          title: 'Complete Task',
          description: 'Task with all fields',
          status: 'completed',
          tags: ['work', 'urgent', 'meeting'],
          due_date: '2025-07-15T14:30:00Z',
          estimated_time: 180,
          is_high_priority: true,
          created_at: '2025-07-06T10:00:00Z',
          updated_at: '2025-07-06T12:00:00Z',
        },
      ];

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: tasks,
      };

      mockDynamoManager.findAll.mockResolvedValue(tasks);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await getAllTaskUseCase(dependencies);

      expect(mockDynamoManager.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when dynamoManager.findAll fails', async () => {
      const error = new Error('Database error');
      mockDynamoManager.findAll.mockRejectedValue(error);

      await expect(getAllTaskUseCase(dependencies)).rejects.toThrow('Database error');
      expect(mockDynamoManager.findAll).toHaveBeenCalledWith();
      expect(responseHandler.success).not.toHaveBeenCalled();
    });

    it('should throw error when dynamoManager.findAll throws generic error', async () => {
      const error = new Error('Unexpected error');
      mockDynamoManager.findAll.mockRejectedValue(error);

      await expect(getAllTaskUseCase(dependencies)).rejects.toThrow(error);
      expect(mockDynamoManager.findAll).toHaveBeenCalledWith();
    });

    it('should handle null response from findAll', async () => {
      const tasks = null;

      const expectedResponse = {
        code: '200',
        message: 'Success',
        data: tasks,
      };

      mockDynamoManager.findAll.mockResolvedValue(tasks);
      (responseHandler.success as jest.Mock).mockReturnValue(expectedResponse);

      const result = await getAllTaskUseCase(dependencies);

      expect(mockDynamoManager.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(expectedResponse);
    });
  });
});
