import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Task, CreateTaskDto, UpdateTaskDto } from "../../../domain/Task";
import { DynamoManager } from "./DynamoManager";
import { v4 as uuidv4 } from 'uuid';
import { Constants } from "../../../utils/constants";
import createHttpError from "http-errors";

export class DynamoImpl implements DynamoManager {
    private client: DynamoDBDocumentClient;
    private tableName: string;

    constructor() {
        const dynamoClient = new DynamoDBClient({
            region: process.env.AWS_REGION || "us-east-1"
        });
        this.client = DynamoDBDocumentClient.from(dynamoClient);
        this.tableName = Constants.TABLE_NAME;
    }

    async findAll(): Promise<Task[]> {
        try {
            const command = new ScanCommand({
                TableName: this.tableName
            });

            const response = await this.client.send(command);
            return response.Items as Task[] || [];
        } catch (error) {
            throw error;
        }
    }

    async findById(id: string): Promise<Task[] | null> {
        try {
            const command = new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: "task_id = :task_id",
                ExpressionAttributeValues: {
                    ":task_id": id
                }
            });

            const response = await this.client.send(command);
            return response.Items && response.Items.length > 0 ? response.Items as Task[] : null;
        } catch (error) {
            throw error;
        }
    }

    async create(taskData: CreateTaskDto): Promise<Task> {
        try {
            const taskId = uuidv4();
            const currentDateTime = new Date().toISOString();

            const newTask: Task = {
                task_id: taskId,
                title: taskData.title,
                description: taskData.description,
                status: taskData.status || "pending",
                tags: taskData.tags || [],
                due_date: taskData.due_date,
                estimated_time: taskData.estimated_time || 0,
                is_high_priority: taskData.is_high_priority || false,
                created_at: currentDateTime,
                updated_at: currentDateTime
            };

            const command = new PutCommand({
                TableName: this.tableName,
                Item: newTask
            });

            await this.client.send(command);
            return newTask;
        } catch (error) {
            throw error;
        }
    }

    async update(id: string, taskData: UpdateTaskDto): Promise<Task | null> {
        try {
            const existingTask = await this.findById(id);
            if (!existingTask || existingTask.length === 0) {
                throw createHttpError(
                    Constants.LAMBDA_RESPONSE_ERROR.NOT_FOUND.httpCode,
                    JSON.stringify(Constants.LAMBDA_RESPONSE_ERROR.NOT_FOUND)
                );
            }

            const currentDateTime = new Date().toISOString();

            const updateExpressions: string[] = [];
            const expressionAttributeNames: { [key: string]: string } = {};
            const expressionAttributeValues: { [key: string]: any } = {};

            updateExpressions.push("#updated_at = :updated_at");
            expressionAttributeNames["#updated_at"] = "updated_at";
            expressionAttributeValues[":updated_at"] = currentDateTime;

            Object.keys(taskData).forEach((key) => {
                if (taskData[key as keyof UpdateTaskDto] !== undefined) {
                    updateExpressions.push(`#${key} = :${key}`);
                    expressionAttributeNames[`#${key}`] = key;
                    expressionAttributeValues[`:${key}`] = taskData[key as keyof UpdateTaskDto];
                }
            });

            const command = new UpdateCommand({
                TableName: this.tableName,
                Key: {
                    task_id: id,
                    created_at: existingTask[0].created_at
                },
                UpdateExpression: `SET ${updateExpressions.join(", ")}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: "ALL_NEW"
            });

            const response = await this.client.send(command);
            return response.Attributes as Task;
        } catch (error) {
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const existingTask = await this.findById(id);
            if (!existingTask || existingTask.length === 0) {
                throw createHttpError(
                    Constants.LAMBDA_RESPONSE_ERROR.NOT_FOUND.httpCode,
                    JSON.stringify(Constants.LAMBDA_RESPONSE_ERROR.NOT_FOUND)
                );
            }

            const command = new DeleteCommand({
                TableName: this.tableName,
                Key: {
                    task_id: id,
                    created_at: existingTask[0].created_at
                }
            });

            await this.client.send(command);
            return true;
        } catch (error) {
            throw error;
        }
    }
}
