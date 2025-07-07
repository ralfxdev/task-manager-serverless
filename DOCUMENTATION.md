# Task Manager API - Documentación Técnica

## Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Dominio y Modelos](#dominio-y-modelos)
5. [Casos de Uso](#casos-de-uso)
6. [Infraestructura](#infraestructura)
7. [Validaciones](#validaciones)
8. [Pruebas Unitarias](#pruebas-unitarias)
9. [Configuración y Despliegue](#configuración-y-despliegue)
10. [Manejo de Errores](#manejo-de-errores)
11. [Utilities y Helpers](#utilities-y-helpers)

---

## Resumen Ejecutivo

El **Task Manager API** es una aplicación serverless construida con Node.js y TypeScript que implementa un sistema CRUD completo para la gestión de tareas. Utiliza AWS Lambda para la computación, API Gateway para la exposición de endpoints REST, y DynamoDB como base de datos NoSQL.

### Tecnologías Utilizadas

- **Runtime**: Node.js 20.x
- **Lenguaje**: TypeScript
- **Framework**: Serverless Framework v4
- **Cloud Provider**: AWS
- **Base de Datos**: DynamoDB
- **Validación**: Joi
- **Testing**: Jest
- **Arquitectura**: Clean Architecture / Hexagonal

---

## Arquitectura del Sistema

### Patrón Arquitectónico

El proyecto implementa **Clean Architecture** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway                               │
│                 (HTTP Endpoints)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 AWS Lambda                                  │
│                 (Handlers)                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Adapters Layer                               │
│            (API Gateway Adapters)                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  Use Cases                                  │
│               (Business Logic)                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Domain Layer                                │
│            (Entities & Interfaces)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│            Infrastructure Layer                             │
│                 (DynamoDB)                                  │
└─────────────────────────────────────────────────────────────┘
```

### Principios Aplicados

1. **Inversión de Dependencias**: Los casos de uso dependen de interfaces, no de implementaciones concretas
2. **Separación de Responsabilidades**: Cada capa tiene una responsabilidad específica
3. **Testabilidad**: Arquitectura que facilita las pruebas unitarias
4. **Escalabilidad**: Diseño que permite añadir nuevas funcionalidades fácilmente

---

## Estructura del Proyecto

```
task-manager/
├── src/
│   ├── cases/                     # Casos de uso (Business Logic)
│   │   ├── createTaskCase.ts
│   │   ├── deleteTaskCase.ts
│   │   ├── getAllTaskCase.ts
│   │   ├── getTaskByIdCase.ts
│   │   └── updateTaskCase.ts
│   ├── domain/                    # Entidades y DTOs
│   │   ├── Task.ts
│   │   ├── common/
│   │   │   └── index.ts
│   │   └── responses/
│   │       └── response.ts
│   ├── infrastructure/            # Capa de infraestructura
│   │   ├── driven/                # Puertos de salida
│   │   │   └── dynamoManager/
│   │   │       ├── DynamoImplementation.ts
│   │   │       └── DynamoManager.ts
│   │   └── driving/               # Puertos de entrada
│   │       └── aws/
│   │           └── api-gateway/
│   │               ├── createTaskAdapter.ts
│   │               ├── deleteTaskAdapter.ts
│   │               ├── getAllTaskAdapter.ts
│   │               ├── getTaskByIdAdapter.ts
│   │               └── updateTaskAdapter.ts
│   └── utils/                     # Utilidades
│       ├── constants.ts
│       ├── httpResponse.ts
│       ├── lambda.ts
│       ├── response.ts
│       ├── utils.ts
│       ├── validationSchemas.ts
│       ├── date/
│       │   └── utils-date.ts
│       └── http/
│           └── response-handler.ts
├── tests/                         # Pruebas unitarias
│   ├── cases/
│   │   ├── createTaskCase.test.ts
│   │   ├── deleteTaskCase.test.ts
│   │   ├── getAllTaskCase.test.ts
│   │   ├── getTaskByIdCase.test.ts
│   │   └── updateTaskCase.test.ts
│   ├── infrastructure/
│   │   └── driven/
│   │       └── dynamoManager/
│   │           └── DynamoImplementation.test.ts
│   └── setup.ts
├── handler.ts                     # Handlers de Lambda
├── serverless.yml                 # Configuración de Serverless
├── jest.config.js                 # Configuración de Jest
├── tsconfig.json                  # Configuración de TypeScript
└── package.json                   # Dependencias del proyecto
```

---

## Dominio y Modelos

### Entidad Task

```typescript
export interface Task {
    task_id: string;           // UUID único
    title: string;             // Título de la tarea
    description: string;       // Descripción detallada
    status: string;            // Estado: pending, in-progress, completed
    tags: string[];            // Etiquetas para categorización
    due_date?: string;         // Fecha límite (ISO 8601)
    estimated_time?: number;   // Tiempo estimado en minutos
    is_high_priority: boolean; // Prioridad alta
    created_at: string;        // Fecha de creación (ISO 8601)
    updated_at?: string;       // Fecha de actualización (ISO 8601)
}
```

### DTOs (Data Transfer Objects)

#### CreateTaskDto
```typescript
export interface CreateTaskDto {
    title: string;             // Requerido
    description: string;       // Requerido
    status?: string;           // Opcional, por defecto 'pending'
    tags?: string[];           // Opcional
    due_date?: string;         // Opcional
    estimated_time?: number;   // Opcional
    is_high_priority?: boolean; // Opcional, por defecto false
}
```

#### UpdateTaskDto
```typescript
export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: string;
    tags?: string[];
    due_date?: string;
    estimated_time?: number;
    is_high_priority?: boolean;
}
```

### Tipos de Dependencias

```typescript
export interface DependenciesType {
    dynamoManager: DynamoManager;
}
```

---

## Casos de Uso

### 1. CreateTaskCase

**Propósito**: Crear una nueva tarea en el sistema

**Flujo**:
1. Recibe datos de entrada `CreateTaskDto`
2. Valida los datos usando esquemas Joi
3. Genera UUID para la tarea
4. Asigna fechas de creación
5. Guarda en DynamoDB
6. Retorna la tarea creada

**Archivo**: `src/cases/createTaskCase.ts`

```typescript
export const createTaskHttp = (): TypeCaseUseCreateTaskHttp => {
    return async (taskData: CreateTaskDto, dependencies: DependenciesType): Promise<any> => {
        const { dynamoManager } = dependencies;
        try {
            const task = await dynamoManager.create(taskData);
            return responseHandler.success("", task)
        } catch (error) {
            throw error;
        }
    };
}
```

### 2. GetAllTaskCase

**Propósito**: Obtener todas las tareas del sistema

**Flujo**:
1. Llama al método `findAll` del DynamoManager
2. Retorna lista de tareas o array vacío

### 3. GetTaskByIdCase

**Propósito**: Obtener una tarea específica por su ID

**Flujo**:
1. Valida que el ID sea un UUID válido
2. Busca la tarea en DynamoDB
3. Retorna la tarea o error 404

### 4. UpdateTaskCase

**Propósito**: Actualizar una tarea existente

**Flujo**:
1. Valida ID y datos de entrada
2. Verifica existencia de la tarea
3. Actualiza campos modificados
4. Asigna fecha de actualización
5. Guarda cambios en DynamoDB

### 5. DeleteTaskCase

**Propósito**: Eliminar una tarea del sistema

**Flujo**:
1. Valida ID de la tarea
2. Verifica existencia
3. Elimina de DynamoDB
4. Retorna confirmación

---

## Infraestructura

### Capa de Datos - DynamoDB

#### DynamoManager Interface

```typescript
export interface DynamoManager {
    findAll(): Promise<Task[]>;
    findById(id: string): Promise<Task | null>;
    create(taskData: CreateTaskDto): Promise<Task>;
    update(id: string, taskData: UpdateTaskDto): Promise<Task>;
    delete(id: string): Promise<void>;
}
```

#### DynamoImplementation

**Configuración**:
- Región: us-east-1 (configurable)
- Tabla: `task-manager-tasks-dev`
- Modelo de facturación: PAY_PER_REQUEST

**Operaciones**:

1. **findAll()**: Escanea toda la tabla
2. **findById()**: Query por partition key
3. **create()**: PutCommand con datos validados
4. **update()**: UpdateCommand con campos modificados
5. **delete()**: DeleteCommand por ID

### Adaptadores de API Gateway

Los adaptadores actúan como puentes entre AWS Lambda y los casos de uso:

#### Responsabilidades:
- Parsear eventos de API Gateway
- Validar parámetros de ruta y query
- Inyectar dependencias
- Manejar errores HTTP
- Formatear respuestas

#### Ejemplo - CreateTaskAdapter:
```typescript
export const getApiGatewayAdapterCreateTaskHttp = (
    caseUse: TypeCaseUseCreateTaskHttp
): TypeApiGatewayAdapterCreateTaskHttp => {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        try {
            const body = JSON.parse(event.body || '{}');
            validateSchema(body, createTaskSchema);
            
            const dependencies = { dynamoManager: new DynamoImpl() };
            const result = await caseUse(body, dependencies);
            
            return lambdaResponse(201, result);
        } catch (error) {
            return handleError(error);
        }
    };
};
```

---

## Validaciones

### Esquemas de Validación (Joi)

#### CreateTaskSchema
```typescript
export const createTaskSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).required(),
    status: Joi.string().valid('pending', 'in-progress', 'completed').default('pending'),
    tags: Joi.array().items(Joi.string()).optional(),
    due_date: Joi.date().iso().optional(),
    estimated_time: Joi.number().integer().min(0).optional(),
    is_high_priority: Joi.boolean().default(false)
});
```

#### UpdateTaskSchema
```typescript
export const updateTaskSchema = Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid('pending', 'in-progress', 'completed').optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    due_date: Joi.date().iso().optional(),
    estimated_time: Joi.number().integer().min(0).optional(),
    is_high_priority: Joi.boolean().optional()
});
```

#### GetByIdSchema
```typescript
export const getByIdSchema = Joi.object({
    id: Joi.string().uuid().required()
});
```

### Función de Validación

```typescript
export const validateSchema = (data: any, schema: Joi.ObjectSchema) => {
    const { error, value } = schema.validate(data);
    if (error) {
        throw createHttpError(400, error.details[0].message);
    }
    return value;
};
```

---

## Pruebas Unitarias

### Configuración de Jest

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: [
    "src/cases/**/*.ts",
    "src/infrastructure/**/*.ts",
    "!src/cases/**/*.d.ts",
    "!src/infrastructure/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Estructura de Pruebas

#### 1. Pruebas de Casos de Uso

**Archivo**: `tests/cases/createTaskCase.test.ts`

**Escenarios de prueba**:

1. **Prueba de Función Factory**:
   ```typescript
   it('should return a function when called', () => {
       const result = createTaskHttp();
       expect(typeof result).toBe('function');
   });
   ```

2. **Creación Exitosa**:
   ```typescript
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
       
       const createdTask = { /* mock task */ };
       mockDynamoManager.create.mockResolvedValue(createdTask);
       
       const result = await createTaskUseCase(taskData, dependencies);
       
       expect(mockDynamoManager.create).toHaveBeenCalledWith(taskData);
       expect(responseHandler.success).toHaveBeenCalledWith("", createdTask);
   });
   ```

3. **Manejo de Errores**:
   ```typescript
   it('should throw error when dynamoManager.create fails', async () => {
       const taskData: CreateTaskDto = { /* test data */ };
       const error = new Error('Database error');
       
       mockDynamoManager.create.mockRejectedValue(error);
       
       await expect(createTaskUseCase(taskData, dependencies))
           .rejects.toThrow('Database error');
   });
   ```

#### 2. Pruebas de Infraestructura

**Archivo**: `tests/infrastructure/driven/dynamoManager/DynamoImplementation.test.ts`

**Escenarios de prueba**:

1. **Configuración de Cliente**:
   ```typescript
   it('should initialize DynamoDB client correctly', () => {
       const dynamoImpl = new DynamoImpl();
       expect(dynamoImpl).toBeInstanceOf(DynamoImpl);
   });
   ```

2. **Operaciones CRUD**:
   ```typescript
   describe('CRUD Operations', () => {
       it('should create a task successfully', async () => {
           // Test implementation
       });
       
       it('should find all tasks', async () => {
           // Test implementation
       });
       
       it('should find task by id', async () => {
           // Test implementation
       });
       
       it('should update task successfully', async () => {
           // Test implementation
       });
       
       it('should delete task successfully', async () => {
           // Test implementation
       });
   });
   ```

### Cobertura de Pruebas

**Objetivo**: Mantener al menos 80% de cobertura en:
- Líneas de código
- Funciones
- Ramas
- Declaraciones

**Áreas cubiertas**:
- ✅ Casos de uso (Business Logic)
- ✅ Implementaciones de infraestructura
- ✅ Validaciones
- ✅ Manejo de errores
- ✅ Transformaciones de datos

**Comandos de prueba**:
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar con cobertura
npm run test:coverage

# Ejecutar en modo watch
npm run test:watch

# Ejecutar para CI/CD
npm run test:ci
```

---

## Configuración y Despliegue

### Serverless Configuration

**Archivo**: `serverless.yml`

```yaml
service: task-manager
org: ralfxdev
app: task-manager

provider:
  name: aws
  runtime: nodejs20.x
  stage: dev
  region: us-east-1
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:Query
            - dynamodb:Scan
            - dynamodb:GetItem
            - dynamodb:PutItem
            - dynamodb:UpdateItem
            - dynamodb:DeleteItem
          Resource: "arn:aws:dynamodb:${self:provider.region}:*:table/task_manager"
```

### Recursos AWS

#### DynamoDB Table
```yaml
resources:
  Resources:
    TasksTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:service}-tasks-${self:provider.stage}
        AttributeDefinitions:
          - AttributeName: task_id
            AttributeType: S
        KeySchema:
          - AttributeName: task_id
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
```

#### Lambda Functions
```yaml
functions:
  get-all-tasks-http:
    handler: handler.getHandlerGetAllTaskHttp
    events:
      - httpApi:
          path: /tasks
          method: get
  
  # ... más funciones
```

### Variables de Entorno

```typescript
// Configuración en runtime
const tableName = process.env.TABLE_NAME || 'task-manager-tasks-dev';
const region = process.env.AWS_REGION || 'us-east-1';
```

---

## Manejo de Errores

### Estrategia de Errores

1. **Errores de Validación** (400): Datos de entrada inválidos
2. **Errores de Recurso No Encontrado** (404): Tarea no existe
3. **Errores del Servidor** (500): Errores internos
4. **Errores de DynamoDB**: Transformados a errores HTTP

### Implementación

```typescript
// utils/http/response-handler.ts
export const handleError = (error: any): APIGatewayProxyResult => {
    console.error('Error:', error);
    
    if (error.statusCode) {
        return lambdaResponse(error.statusCode, {
            error: error.message
        });
    }
    
    return lambdaResponse(500, {
        error: 'Internal Server Error'
    });
};
```

### Códigos de Estado HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado
- **400 Bad Request**: Datos inválidos
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error interno

---

## Utilities y Helpers

### Constants

```typescript
export class Constants {
    static readonly TABLE_NAME = process.env.TABLE_NAME || 'task-manager-tasks-dev';
    static readonly AWS_REGION = process.env.AWS_REGION || 'us-east-1';
}
```

### Response Handlers

```typescript
// HTTP Response formatting
export const lambdaResponse = (statusCode: number, body: any): APIGatewayProxyResult => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(body),
    };
};
```

### Date Utilities

```typescript
// utils/date/utils-date.ts
export const getCurrentISODate = (): string => {
    return new Date().toISOString();
};

export const formatDate = (date: string): string => {
    return moment(date).tz('UTC').format();
};
```