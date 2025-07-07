# Task Manager API

API RESTful para gestión de tareas construida con Node.js, TypeScript, AWS Lambda, API Gateway y DynamoDB usando el Serverless Framework.

## Características

- **CRUD completo**: Crear, leer, actualizar y eliminar tareas
- **Arquitectura sin servidor**: Desplegada en AWS Lambda
- **Base de datos**: DynamoDB para almacenamiento
- **Validación**: Esquemas de validación con Joi
- **Pruebas**: Test unitarios con Jest
- **TypeScript**: Tipado estático para mejor mantenibilidad

## Estructura de una Tarea

```typescript
{
  "task_id": "string",
  "title": "string",
  "description": "string",
  "status": "string",
  "tags": ["string"],
  "due_date": "string (ISO 8601)",
  "estimated_time": "number (minutos)",
  "is_high_priority": "boolean",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

## Prerequisitos

- Node.js 20.x o superior
- AWS CLI configurado con credenciales
- Serverless Framework instalado globalmente

```bash
npm install -g serverless
```

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:

```bash
npm install
```

## Despliegue

Para desplegar la API en AWS, ejecutar:

```bash
serverless deploy
```

Este comando creará:
- Funciones Lambda para cada endpoint
- API Gateway con los endpoints configurados
- Tabla DynamoDB para almacenar las tareas
- Roles y políticas IAM necesarias

Después del despliegue, verás una salida similar a:

```
Deploying "task-manager" to stage "dev" (us-east-1)

✔ Service deployed to stack task-manager-dev (120s)

endpoint: 
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks/{id}
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks
  PUT - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks/{id}
  DELETE - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks/{id}
```

## Endpoints de la API

### 1. Obtener todas las tareas

```bash
GET /tasks
```

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "task_id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Completar proyecto",
      "description": "Finalizar el desarrollo de la API",
      "status": "in_progress",
      "tags": ["desarrollo", "api"],
      "due_date": "2025-07-10T00:00:00.000Z",
      "estimated_time": 120,
      "is_high_priority": true,
      "created_at": "2025-07-06T10:00:00.000Z",
      "updated_at": "2025-07-06T11:00:00.000Z"
    }
  ]
}
```

### 2. Obtener una tarea por ID

```bash
GET /tasks/{id}
```

**Respuesta exitosa (200):**
```json
{
  "data": {
    "task_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Completar proyecto",
    "description": "Finalizar el desarrollo de la API",
    "status": "in_progress",
    "tags": ["desarrollo", "api"],
    "due_date": "2025-07-10T00:00:00.000Z",
    "estimated_time": 120,
    "is_high_priority": true,
    "created_at": "2025-07-06T10:00:00.000Z",
    "updated_at": "2025-07-06T11:00:00.000Z"
  }
}
```

### 3. Crear una nueva tarea

```bash
POST /tasks
```

**Cuerpo de la petición:**
```json
{
  "title": "Nueva tarea",
  "description": "Descripción de la tarea",
  "status": "pending",
  "tags": ["etiqueta1", "etiqueta2"],
  "due_date": "2025-07-10T00:00:00.000Z",
  "estimated_time": 60,
  "is_high_priority": false
}
```

**Respuesta exitosa (201):**
```json
{
  "data": {
    "task_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Nueva tarea",
    "description": "Descripción de la tarea",
    "status": "pending",
    "tags": ["etiqueta1", "etiqueta2"],
    "due_date": "2025-07-10T00:00:00.000Z",
    "estimated_time": 60,
    "is_high_priority": false,
    "created_at": "2025-07-06T10:00:00.000Z"
  }
}
```

### 4. Actualizar una tarea

```bash
PUT /tasks/{id}
```

**Cuerpo de la petición:**
```json
{
  "title": "Tarea actualizada",
  "status": "completed"
}
```

**Respuesta exitosa (200):**
```json
{
  "data": {
    "task_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Tarea actualizada",
    "description": "Descripción de la tarea",
    "status": "completed",
    "tags": ["etiqueta1", "etiqueta2"],
    "due_date": "2025-07-10T00:00:00.000Z",
    "estimated_time": 60,
    "is_high_priority": false,
    "created_at": "2025-07-06T10:00:00.000Z",
    "updated_at": "2025-07-06T12:00:00.000Z"
  }
}
```

### 5. Eliminar una tarea

```bash
DELETE /tasks/{id}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Tarea eliminada exitosamente"
}
```

## Ejemplos de Uso con cURL

### Crear una tarea:
```bash
curl -X POST https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Revisar código",
    "description": "Hacer code review del PR #123",
    "status": "pending",
    "tags": ["review", "código"],
    "due_date": "2025-07-08T00:00:00.000Z",
    "estimated_time": 30,
    "is_high_priority": true
  }'
```

### Obtener todas las tareas:
```bash
curl -X GET https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks
```

### Obtener una tarea específica:
```bash
curl -X GET https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks/123e4567-e89b-12d3-a456-426614174000
```

### Actualizar una tarea:
```bash
curl -X PUT https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Eliminar una tarea:
```bash
curl -X DELETE https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks/123e4567-e89b-12d3-a456-426614174000
```

## Desarrollo Local

### Usando Serverless Dev

Para desarrollar y probar localmente:

```bash
serverless dev
```

Este comando iniciará un emulador local de AWS Lambda que tuneliza las peticiones desde y hacia AWS Lambda, permitiendo interactuar con la función como si estuviera ejecutándose en la nube.

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests para CI/CD
npm run test:ci
```

## Códigos de Estado HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos de entrada inválidos
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error interno del servidor

## Validaciones

### Campos requeridos para crear una tarea:
- `title`: string (mínimo 1 caracter)
- `description`: string (mínimo 1 caracter)

### Campos opcionales:
- `status`: string (valores: "pending", "in_progress", "completed")
- `tags`: array de strings
- `due_date`: string en formato ISO 8601
- `estimated_time`: number (minutos)
- `is_high_priority`: boolean

### Campos requeridos para actualizar una tarea:
- Al menos un campo debe ser proporcionado

## Notas Importantes

- La API está configurada como pública después del despliegue
- Para producciones, considera implementar autorización
- Los IDs de las tareas son generados automáticamente usando UUID v4
- Las fechas se manejan en formato ISO 8601 (UTC)
- El tiempo estimado se expresa en minutos
