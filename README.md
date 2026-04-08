# API de Gastos Compartidos

API RESTful para gestionar grupos, miembros y gastos comunes. Es un proyecto de aprendizaje orientado a portfolio, construido con `Node.js`, `Express` y `PostgreSQL`, con foco en autenticación, validación, reglas de negocio y testing backend.

## ✨ Qué hace este proyecto

Con esta API se puede:

- registrar e iniciar sesión de usuarios con `JWT`
- consultar y actualizar el perfil autenticado
- crear grupos de gastos y archivarlos
- añadir miembros y gestionar roles (`admin` / `member`)
- registrar gastos con reparto personalizado por usuario
- consultar balances dentro de un grupo
- validar entradas con `Zod`
- probar flujos clave con `Jest` y `Supertest`

---

## 🛠️ Stack técnico

- **Runtime:** `Node.js`
- **Framework:** `Express 5`
- **Base de datos:** `PostgreSQL`
- **Cliente SQL:** `pg`
- **Autenticación:** `jsonwebtoken`
- **Hash de contraseñas:** `bcrypt`
- **Validación:** `Zod`
- **Testing:** `Jest` + `Supertest`
- **Desarrollo:** `nodemon`

---

## 📦 Instalación

### 1) Clonar el repositorio

```bash
git clone https://github.com/DaniCabrera91/shared-expenses-api.git
cd shared-expenses-api
```

### 2) Instalar dependencias

```bash
npm install
```

### 3) Crear las bases de datos

```sql
CREATE DATABASE shared_expenses;
CREATE DATABASE shared_expenses_test;
```

### 4) Ejecutar el esquema

```bash
psql -d shared_expenses -f db/schema.sql
psql -d shared_expenses_test -f db/schema.sql
```

> Si tu usuario de PostgreSQL no tiene permisos suficientes, tendrás que concederlos sobre tablas y secuencias del esquema `public`.

---

## ⚙️ Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shared_expenses
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db
JWT_SECRET=una_clave_larga_y_segura
```

Para tests, crea también `.env.test`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shared_expenses_test
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db
JWT_SECRET=test_jwt_secret
```

---

## 🌱 Datos de ejemplo

Puedes cargar datos iniciales con:

```bash
npm run db:seed
```

El seeder inserta, de forma idempotente:

- usuarios de ejemplo como `dani@example.com`, `borja@example.com` y `carmen@example.com`
- un grupo llamado `Vacaciones` con emoji `🏖️`
- dos gastos de muestra
- sus correspondientes repartos en `expense_shares`

---

## ▶️ Ejecutar la aplicación

### Desarrollo

```bash
npm run dev
```

### Modo normal

```bash
npm start
```

La API queda disponible en:

```text
http://localhost:3000/api
```

Health check:

```http
GET /api/health
```

---

## 📜 Scripts disponibles

| Script               | Descripción                        |
| -------------------- | ---------------------------------- |
| `npm start`          | Arranca el servidor en modo normal |
| `npm run dev`        | Arranca el servidor con `nodemon`  |
| `npm test`           | Ejecuta toda la suite de tests     |
| `npm run test:watch` | Ejecuta tests en modo observación  |
| `npm run db:seed`    | Carga los datos de ejemplo         |

---

## 🧱 Estructura del proyecto

```text
src/
  auth/          # registro, login, validaciones
  users/         # perfil y actualización de usuario
  groups/        # grupos, miembros, roles y archivado
  expenses/      # gastos, shares y balances
  middlewares/   # auth, validación y manejo de errores
  utils/         # helpers reutilizables
  config/        # conexión a PostgreSQL

db/
  schema.sql     # esquema principal
  seeders/       # datos de ejemplo

test/
  auth/          # tests de auth
  users/         # tests de usuarios
  groups/        # tests de grupos
  expenses/      # tests de gastos
  helpers/       # utilidades para tests
```

---

## 🗃️ Modelo de datos

Las tablas principales son:

- `users`: usuarios registrados
- `groups`: grupos de gastos
- `group_members`: relación usuario-grupo con rol
- `expenses`: gasto creado dentro de un grupo
- `expense_shares`: cuánto debe cada miembro en un gasto
- `currencies`: catálogo básico de monedas (`EUR`, `USD`, `GBP`, `JPY`)

Algunas reglas importantes del modelo:

- un grupo puede tener varios miembros
- un miembro puede ser `admin` o `member`
- un gasto pertenece a un solo grupo
- la suma de `shares` debe coincidir con `total_amount`
- no se puede dejar a un grupo sin su último administrador

---

## 🔐 Autenticación

La API usa `Bearer Token` en la cabecera `Authorization`:

```http
Authorization: Bearer <token>
```

El token se obtiene al iniciar sesión en `POST /api/auth/login`.

---

## 📚 Endpoints principales

### Auth

| Método | Endpoint             | Descripción                  |
| ------ | -------------------- | ---------------------------- |
| `POST` | `/api/auth/register` | Registrar un nuevo usuario   |
| `POST` | `/api/auth/login`    | Iniciar sesión y obtener JWT |

**Payload de registro:**

```json
{
  "first_name": "Daniel",
  "last_name": "Cabrera",
  "alias": "danitxu",
  "email": "dani@example.com",
  "password": "PasswordSegura123"
}
```

**Payload de login:**

```json
{
  "email": "dani@example.com",
  "password": "PasswordSegura123"
}
```

### Usuarios

| Método  | Endpoint        | Requiere auth | Descripción                    |
| ------- | --------------- | ------------- | ------------------------------ |
| `GET`   | `/api/users/me` | Sí            | Obtener el usuario autenticado |
| `PATCH` | `/api/users/me` | Sí            | Actualizar perfil              |

**Payload de actualización:**

```json
{
  "first_name": "Dani",
  "alias": "dani_dev"
}
```

### Grupos

| Método   | Endpoint                                    | Requiere auth | Descripción                 |
| -------- | ------------------------------------------- | ------------- | --------------------------- |
| `POST`   | `/api/groups`                               | Sí            | Crear grupo                 |
| `GET`    | `/api/groups`                               | Sí            | Listar grupos del usuario   |
| `GET`    | `/api/groups/:groupId`                      | Sí            | Obtener detalle de un grupo |
| `PATCH`  | `/api/groups/:groupId/archive`              | Sí            | Archivar grupo              |
| `POST`   | `/api/groups/:groupId/members`              | Sí            | Añadir participantes        |
| `GET`    | `/api/groups/:groupId/members`              | Sí            | Listar miembros             |
| `PATCH`  | `/api/groups/:groupId/members/:userId/role` | Sí            | Cambiar rol                 |
| `DELETE` | `/api/groups/:groupId/members/:userId`      | Sí            | Eliminar miembro            |
| `DELETE` | `/api/groups/:groupId/leave`                | Sí            | Salir del grupo             |

**Payload para crear grupo:**

```json
{
  "name": "Viaje a Lisboa",
  "emoji": "✈️",
  "currency": "EUR"
}
```

**Payload para añadir participantes:**

```json
{
  "participants": [
    { "user_id": "uuid-del-usuario-1" },
    { "user_id": "uuid-del-usuario-2" }
  ]
}
```

### Gastos

| Método   | Endpoint                                 | Requiere auth | Descripción                  |
| -------- | ---------------------------------------- | ------------- | ---------------------------- |
| `POST`   | `/api/expenses/groups/:groupId/expenses` | Sí            | Crear gasto en un grupo      |
| `GET`    | `/api/expenses/groups/:groupId/expenses` | Sí            | Listar gastos del grupo      |
| `GET`    | `/api/expenses/expenses/:expenseId`      | Sí            | Obtener un gasto concreto    |
| `DELETE` | `/api/expenses/expenses/:expenseId`      | Sí            | Eliminar gasto               |
| `GET`    | `/api/expenses/groups/:groupId/balances` | Sí            | Consultar balances del grupo |

**Payload para crear gasto:**

```json
{
  "description": "Apartamento",
  "total_amount": 600,
  "currency": "EUR",
  "paid_by": "uuid-del-pagador",
  "shares": [
    { "user_id": "uuid-1", "amount_owed": 200 },
    { "user_id": "uuid-2", "amount_owed": 200 },
    { "user_id": "uuid-3", "amount_owed": 200 }
  ]
}
```

---

## ✅ Validaciones y reglas de negocio

El proyecto ya contempla varias reglas útiles para un backend real:

- email validado y normalizado
- contraseña con mínimo de `12` caracteres, mayúsculas, minúsculas y número
- alias y nombres con validación de formato
- el gasto debe tener un `total_amount > 0`
- la suma de los importes de `shares` debe coincidir con el total
- solo miembros del grupo pueden consultar su información
- no se puede quitar o degradar al último `admin` del grupo

---

## 🚨 Manejo de errores

La API devuelve respuestas JSON coherentes para errores comunes:

- `400` → validación o datos inválidos
- `401` / `403` → autenticación o permisos
- `404` → recurso no encontrado
- `409` → conflicto, por ejemplo email duplicado
- `500` → error interno del servidor

Ejemplo:

```json
{
  "error": "Error de validación",
  "details": [
    {
      "path": "email",
      "message": "Email no válido"
    }
  ]
}
```

---

## 🧪 Testing

### Ejecutar tests

```bash
npm test
```

### Qué se está probando actualmente

La suite está organizada por dominio:

- `test/auth` → registro y login
- `test/users` → perfil y actualización
- `test/groups` → creación de grupos, miembros y roles
- `test/expenses` → creación de gastos, consulta y balances

Además, se usa una base de datos de prueba y limpieza entre tests para aislar los escenarios.

### ¿Hace falta testear absolutamente todo?

**No hace falta testear “todo por todo”.** Para un proyecto de portfolio, lo importante es cubrir bien lo que aporta valor y evita regresiones:

#### Prioridad alta

- flujos principales felices
- validaciones de entrada
- permisos/autorización
- reglas de negocio importantes
- casos límite que puedan romper cálculos o seguridad

#### Prioridad media

- respuestas de error esperadas
- casos de duplicados, recursos inexistentes o datos incompletos

#### Prioridad baja o innecesaria

- internals de Express
- librerías externas ya probadas por sus autores
- código trivial que ya queda cubierto indirectamente por tests de integración

> Para portfolio, suele pesar más una suite pequeña pero bien pensada que intentar forzar un `100%` de coverage sin criterio.

---

## 🚀 Posibles mejoras futuras

Algunas ideas para seguir ampliando el proyecto:

- documentación OpenAPI / Swagger
- `Docker` + `docker-compose`
- CI con GitHub Actions
- paginación y filtros en listados
- liquidación automática entre miembros
- refresh tokens / logout seguro
- rate limiting y hardening de seguridad

---

## 👨‍💻 Enfoque del proyecto

Este repositorio está planteado como proyecto de aprendizaje y portfolio backend. El objetivo no es solo “que funcione”, sino mostrar:

- diseño por módulos
- separación entre rutas, controladores y servicios
- uso de middlewares reutilizables
- validación y manejo de errores
- pruebas automatizadas sobre lógica y endpoints

Si quieres, en el siguiente paso también te puedo dejar el `README` con un tono más “pro” para recruiters o más “personal” para portfolio.
