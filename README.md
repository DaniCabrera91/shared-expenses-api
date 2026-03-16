# API de Gastos Compartidos

Una API RESTful para gestionar gastos compartidos entre grupos de usuarios. Construida con Node.js, Express y PostgreSQL, incluye autenticación JWT, validación de entradas con Zod y cobertura completa de pruebas.

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Hashing de Contraseñas**: bcrypt
- **Validación**: Esquemas Zod
- **Pruebas**: Jest, Supertest
- **Cliente de Base de Datos**: pg (node-postgres)

## Prerrequisitos

- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## Instalación

1. Clona el repositorio:

   ```bash
   git clone <url-del-repositorio>
   cd shared-expenses-api
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura las variables de entorno (ver sección de Configuración).

## Configuración

Crea un archivo `.env` en el directorio raíz con las siguientes variables:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shared_expenses
DB_USER=tu_usuario_db
DB_PASSWORD=tu_contraseña_db
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=7d
```

Para pruebas, crea un archivo `.env.test` con configuraciones de base de datos de prueba:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shared_expenses_test
DB_USER=tu_usuario_db
DB_PASSWORD=tu_contraseña_db
JWT_SECRET=test_jwt_secret
JWT_EXPIRES_IN=1h
```

## Configuración de la Base de Datos

1. Crea la base de datos:

   ```sql
   CREATE DATABASE shared_expenses;
   ```

2. Ejecuta el esquema:

   ```bash
   psql shared_expenses < db/schema.sql
   ```

3. (Opcional) Siembra la base de datos con datos de ejemplo:
   ```bash
   psql shared_expenses < db/seeds/sample_data.sql
   ```

## Ejecutar la Aplicación

Inicia el servidor de desarrollo:

```bash
npm start
```

La API estará disponible en `http://localhost:3000`.

## Pruebas

Ejecuta el conjunto de pruebas:

```bash
npm test
```

Ejecuta pruebas con cobertura:

```bash
npm run test:coverage
```

Las pruebas incluyen:

- Pruebas unitarias para servicios
- Pruebas de integración para controladores y rutas
- Aislamiento de transacciones de base de datos para datos de prueba

## Documentación de la API

### Autenticación

#### Registro

- **POST** `/auth/register`
- Cuerpo: `{ "username": "string", "email": "string", "password": "string" }`
- Respuesta: Datos del usuario con token JWT

#### Inicio de Sesión

- **POST** `/auth/login`
- Cuerpo: `{ "email": "string", "password": "string" }`
- Respuesta: Token JWT

### Usuarios

#### Obtener Perfil

- **GET** `/users/profile`
- Cabeceras: `Authorization: Bearer <token>`
- Respuesta: Datos del perfil del usuario

#### Actualizar Perfil

- **PUT** `/users/profile`
- Cabeceras: `Authorization: Bearer <token>`
- Cuerpo: `{ "username": "string", "email": "string" }`
- Respuesta: Datos actualizados del usuario

### Grupos

#### Crear Grupo

- **POST** `/groups`
- Cabeceras: `Authorization: Bearer <token>`
- Cuerpo: `{ "name": "string", "description": "string" }`
- Respuesta: Datos del grupo

#### Obtener Grupos del Usuario

- **GET** `/groups`
- Cabeceras: `Authorization: Bearer <token>`
- Respuesta: Array de grupos del usuario

#### Agregar Miembro a Grupo

- **POST** `/groups/:groupId/members`
- Cabeceras: `Authorization: Bearer <token>`
- Cuerpo: `{ "userId": "uuid" }`
- Respuesta: Mensaje de éxito

#### Remover Miembro de Grupo

- **DELETE** `/groups/:groupId/members/:userId`
- Cabeceras: `Authorization: Bearer <token>`
- Respuesta: Mensaje de éxito

### Gastos

#### Crear Gasto

- **POST** `/expenses`
- Cabeceras: `Authorization: Bearer <token>`
- Cuerpo: `{ "groupId": "uuid", "description": "string", "amount": "number", "paidBy": "uuid" }`
- Respuesta: Datos del gasto

#### Obtener Gastos del Grupo

- **GET** `/expenses/group/:groupId`
- Cabeceras: `Authorization: Bearer <token>`
- Respuesta: Array de gastos del grupo

#### Obtener Saldos de Gastos

- **GET** `/expenses/balances/:groupId`
- Cabeceras: `Authorization: Bearer <token>`
- Respuesta: Cálculos de saldos para miembros del grupo

## Estructura del Proyecto

```
src/
├── app.js                 # Configuración de la app Express
├── index.js               # Punto de entrada del servidor
├── config/
│   └── db.js              # Configuración de la base de datos
├── auth/                  # Módulo de autenticación
├── users/                 # Gestión de usuarios
├── groups/                # Gestión de grupos
├── expenses/              # Seguimiento de gastos
├── middlewares/           # Middleware personalizado
└── utils/                 # Funciones utilitarias

db/
├── schema.sql             # Esquema de la base de datos
├── create_db.sql          # Script de creación de base de datos
└── seeds/                 # Datos de ejemplo

test/                      # Archivos de pruebas y helpers
```

## Contribuir

1. Haz un fork del repositorio
2. Crea una rama de funcionalidad: `git checkout -b feature/tu-funcionalidad`
3. Confirma tus cambios: `git commit -am 'Agrega alguna funcionalidad'`
4. Sube a la rama: `git push origin feature/tu-funcionalidad`
5. Envía un pull request

## Licencia

Este proyecto está bajo la Licencia MIT. (Si no has usado licencias antes, considera agregar un archivo `LICENSE` con el texto estándar de MIT para mayor claridad.)
