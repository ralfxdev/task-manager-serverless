import { DynamoImpl } from '../../../../src/infrastructure/driven/dynamoManager/DynamoImplementation';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../../../src/domain/Task';
import { Constants } from '../../../../src/utils/constants';
import { v4 as uuidv4 } from 'uuid';

jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('uuid');
jest.mock('../../../../src/utils/constants');

describe('DynamoImplementation', () => {
  let dynamoImpl: DynamoImpl;
  let mockSend: jest.Mock;
  let mockDynamoDBClient: jest.Mocked<DynamoDBClient>;
  let mockDocumentClient: jest.Mocked<DynamoDBDocumentClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDynamoDBClient = {
      send: jest.fn(),
      config: {},
      destroy: jest.fn(),
    } as any;
    
    mockSend = jest.fn();
    mockDocumentClient = {
      send: mockSend,
    } as any;

    (DynamoDBClient as jest.Mock).mockImplementation(() => mockDynamoDBClient);
    (DynamoDBDocumentClient.from as jest.Mock).mockReturnValue(mockDocumentClient);
    
    (Constants as any).TABLE_NAME = 'test-table';
    
    (uuidv4 as jest.Mock).mockReturnValue('test-uuid-123');
    
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-07-06T10:00:00.000Z');
    
    process.env.AWS_REGION = 'us-east-1';

    dynamoImpl = new DynamoImpl();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.AWS_REGION;
  });

  describe('constructor', () => {
    it('should initialize DynamoDB client with default region', () => {
      expect(DynamoDBClient).toHaveBeenCalledWith({
        region: 'us-east-1'
      });
      expect(DynamoDBDocumentClient.from).toHaveBeenCalledWith(mockDynamoDBClient);
      expect(dynamoImpl).toBeInstanceOf(DynamoImpl);
    });

    it('should initialize DynamoDB client with fallback region when AWS_REGION is not set', () => {
      delete process.env.AWS_REGION;
      jest.clearAllMocks();
      
      new DynamoImpl();
      
      expect(DynamoDBClient).toHaveBeenCalledWith({
        region: 'us-east-1'
      });
    });
  });

  describe('findAll', () => {
    it('should return all tasks successfully', async () => {
      const mockTasks: Task[] = [
        {
          task_id: '1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'pending',
          tags: ['tag1'],
          is_high_priority: false,
          created_at: '2025-07-06T10:00:00.000Z',
          updated_at: '2025-07-06T10:00:00.000Z',
        },
        {
          task_id: '2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'completed',
          tags: ['tag2'],
          is_high_priority: true,
          created_at: '2025-07-06T10:00:00.000Z',
          updated_at: '2025-07-06T10:00:00.000Z',
        },
      ];

      mockSend.mockResolvedValue({ Items: mockTasks });

      const result = await dynamoImpl.findAll();

      expect(mockSend).toHaveBeenCalledWith(expect.any(ScanCommand));
      expect(result).toEqual(mockTasks);
    });

    it('should return empty array when no tasks found', async () => {
      mockSend.mockResolvedValue({ Items: [] });

      const result = await dynamoImpl.findAll();

      expect(result).toEqual([]);
    });

    it('should return empty array when Items is undefined', async () => {
      mockSend.mockResolvedValue({});

      const result = await dynamoImpl.findAll();

      expect(result).toEqual([]);
    });

    it('should throw error when DynamoDB operation fails', async () => {
      const error = new Error('DynamoDB error');
      mockSend.mockRejectedValue(error);

      await expect(dynamoImpl.findAll()).rejects.toThrow('DynamoDB error');
      expect(mockSend).toHaveBeenCalledWith(expect.any(ScanCommand));
    });
  });

  describe('findById', () => {
    it('should return task by id successfully', async () => {
      const mockTask: Task = {
        task_id: '123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        tags: ['test'],
        is_high_priority: false,
        created_at: '2025-07-06T10:00:00.000Z',
        updated_at: '2025-07-06T10:00:00.000Z',
      };

      mockSend.mockResolvedValue({ Items: [mockTask] });

      const result = await dynamoImpl.findById('123');

      expect(mockSend).toHaveBeenCalledWith(expect.any(QueryCommand));
      expect(result).toEqual([mockTask]);
    });

    it('should return null when task not found', async () => {
      mockSend.mockResolvedValue({ Items: [] });

      const result = await dynamoImpl.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null when Items is undefined', async () => {
      mockSend.mockResolvedValue({});

      const result = await dynamoImpl.findById('123');

      expect(result).toBeNull();
    });

    it('should throw error when DynamoDB operation fails', async () => {
      const error = new Error('DynamoDB error');
      mockSend.mockRejectedValue(error);

      await expect(dynamoImpl.findById('123')).rejects.toThrow('DynamoDB error');
      expect(mockSend).toHaveBeenCalledWith(expect.any(QueryCommand));
    });
  });

  describe('create', () => {
    it('should create task with all fields successfully', async () => {
      const taskData: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'in_progress',
        tags: ['tag1', 'tag2'],
        due_date: '2025-07-15',
        estimated_time: 120,
        is_high_priority: true,
      };

      mockSend.mockResolvedValue({});

      const result = await dynamoImpl.create(taskData);

      expect(mockSend).toHaveBeenCalledWith(expect.any(PutCommand));
      expect(result).toEqual({
        task_id: 'test-uuid-123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'in_progress',
        tags: ['tag1', 'tag2'],
        due_date: '2025-07-15',
        estimated_time: 120,
        is_high_priority: true,
        created_at: '2025-07-06T10:00:00.000Z',
        updated_at: '2025-07-06T10:00:00.000Z',
      });
    });

    it('should create task with default values for optional fields', async () => {
      const taskData: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
      };

      mockSend.mockResolvedValue({});

      const result = await dynamoImpl.create(taskData);

      expect(mockSend).toHaveBeenCalledWith(expect.any(PutCommand));
      expect(result.status).toBe('pending');
      expect(result.tags).toEqual([]);
      expect(result.estimated_time).toBe(0);
      expect(result.is_high_priority).toBe(false);
    });

    it('should create task with partial optional fields', async () => {
      const taskData: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'in_progress',
        is_high_priority: true,
      };

      mockSend.mockResolvedValue({});

      const result = await dynamoImpl.create(taskData);

      expect(result.status).toBe('in_progress');
      expect(result.is_high_priority).toBe(true);
      expect(result.tags).toEqual([]);
      expect(result.estimated_time).toBe(0);
    });

    it('should throw error when DynamoDB operation fails', async () => {
      const taskData: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
      };

      const error = new Error('DynamoDB error');
      mockSend.mockRejectedValue(error);

      await expect(dynamoImpl.create(taskData)).rejects.toThrow('DynamoDB error');
      expect(mockSend).toHaveBeenCalledWith(expect.any(PutCommand));
    });
  });

  describe('update', () => {
    it('should update task successfully', async () => {
      const existingTask: Task = {
        task_id: '123',
        title: 'Original Task',
        description: 'Original Description',
        status: 'pending',
        tags: ['tag1'],
        is_high_priority: false,
        created_at: '2025-07-06T09:00:00.000Z',
        updated_at: '2025-07-06T09:00:00.000Z',
      };

      const updateData: UpdateTaskDto = {
        title: 'Updated Task',
        status: 'in_progress',
        is_high_priority: true,
      };

      const updatedTask: Task = {
        ...existingTask,
        ...updateData,
        updated_at: '2025-07-06T10:00:00.000Z',
      };

      mockSend.mockResolvedValueOnce({ Items: [existingTask] });
      mockSend.mockResolvedValueOnce({ Attributes: updatedTask });

      const result = await dynamoImpl.update('123', updateData);

      expect(mockSend).toHaveBeenCalledTimes(2);
      expect(mockSend).toHaveBeenNthCalledWith(1, expect.any(QueryCommand));
      expect(mockSend).toHaveBeenNthCalledWith(2, expect.any(UpdateCommand));
      expect(result).toEqual(updatedTask);
    });

    it('should return null when task not found', async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      await expect(dynamoImpl.update('non-existent-id', { title: 'Updated Task' })).rejects.toThrow();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should return null when findById returns null items', async () => {
      mockSend.mockResolvedValueOnce({});

      await expect(dynamoImpl.update('non-existent-id', { title: 'Updated Task' })).rejects.toThrow();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should handle update with undefined values', async () => {
      const existingTask: Task = {
        task_id: '123',
        title: 'Original Task',
        description: 'Original Description',
        status: 'pending',
        tags: ['tag1'],
        is_high_priority: false,
        created_at: '2025-07-06T09:00:00.000Z',
        updated_at: '2025-07-06T09:00:00.000Z',
      };

      const updateData: UpdateTaskDto = {
        title: 'Updated Task',
        status: undefined,
        description: undefined,
      };

      const updatedTask: Task = {
        ...existingTask,
        title: 'Updated Task',
        updated_at: '2025-07-06T10:00:00.000Z',
      };

      mockSend.mockResolvedValueOnce({ Items: [existingTask] });
      mockSend.mockResolvedValueOnce({ Attributes: updatedTask });

      const result = await dynamoImpl.update('123', updateData);

      expect(mockSend).toHaveBeenCalledTimes(2);
      expect(result).toEqual(updatedTask);
    });

    it('should handle update with all fields', async () => {
      const existingTask: Task = {
        task_id: '123',
        title: 'Original Task',
        description: 'Original Description',
        status: 'pending',
        tags: ['tag1'],
        is_high_priority: false,
        created_at: '2025-07-06T09:00:00.000Z',
        updated_at: '2025-07-06T09:00:00.000Z',
      };

      const updateData: UpdateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'completed',
        tags: ['tag1', 'tag2'],
        due_date: '2025-07-15',
        estimated_time: 120,
        is_high_priority: true,
      };

      const updatedTask: Task = {
        ...existingTask,
        ...updateData,
        updated_at: '2025-07-06T10:00:00.000Z',
      };

      mockSend.mockResolvedValueOnce({ Items: [existingTask] });
      mockSend.mockResolvedValueOnce({ Attributes: updatedTask });

      const result = await dynamoImpl.update('123', updateData);

      expect(result).toEqual(updatedTask);
    });

    it('should throw error when DynamoDB operation fails on findById', async () => {
      const error = new Error('DynamoDB error');
      mockSend.mockRejectedValue(error);

      await expect(dynamoImpl.update('123', { title: 'Updated Task' })).rejects.toThrow('DynamoDB error');
    });

    it('should throw error when DynamoDB operation fails on update', async () => {
      const existingTask: Task = {
        task_id: '123',
        title: 'Original Task',
        description: 'Original Description',
        status: 'pending',
        tags: ['tag1'],
        is_high_priority: false,
        created_at: '2025-07-06T09:00:00.000Z',
        updated_at: '2025-07-06T09:00:00.000Z',
      };

      mockSend.mockResolvedValueOnce({ Items: [existingTask] });
      mockSend.mockRejectedValueOnce(new Error('Update failed'));

      await expect(dynamoImpl.update('123', { title: 'Updated Task' })).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete task successfully', async () => {
      const existingTask: Task = {
        task_id: '123',
        title: 'Task to Delete',
        description: 'Description',
        status: 'pending',
        tags: ['tag1'],
        is_high_priority: false,
        created_at: '2025-07-06T09:00:00.000Z',
        updated_at: '2025-07-06T09:00:00.000Z',
      };

      mockSend.mockResolvedValueOnce({ Items: [existingTask] });
      mockSend.mockResolvedValueOnce({});

      const result = await dynamoImpl.delete('123');

      expect(mockSend).toHaveBeenCalledTimes(2);
      expect(mockSend).toHaveBeenNthCalledWith(1, expect.any(QueryCommand));
      expect(mockSend).toHaveBeenNthCalledWith(2, expect.any(DeleteCommand));
      expect(result).toBe(true);
    });

    it('should return false when task not found', async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      await expect(dynamoImpl.delete('non-existent-id')).rejects.toThrow();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should return false when findById returns null items', async () => {
      mockSend.mockResolvedValueOnce({});

      await expect(dynamoImpl.delete('non-existent-id')).rejects.toThrow();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should throw error when DynamoDB operation fails on findById', async () => {
      const error = new Error('DynamoDB error');
      mockSend.mockRejectedValue(error);

      await expect(dynamoImpl.delete('123')).rejects.toThrow('DynamoDB error');
    });

    it('should throw error when DynamoDB operation fails on delete', async () => {
      const existingTask: Task = {
        task_id: '123',
        title: 'Task to Delete',
        description: 'Description',
        status: 'pending',
        tags: ['tag1'],
        is_high_priority: false,
        created_at: '2025-07-06T09:00:00.000Z',
        updated_at: '2025-07-06T09:00:00.000Z',
      };

      mockSend.mockResolvedValueOnce({ Items: [existingTask] });
      mockSend.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(dynamoImpl.delete('123')).rejects.toThrow('Delete failed');
    });
  });
});
