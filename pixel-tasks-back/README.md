# Pixel Tasks Backend

This is the backend service for the **Pixel Tasks** gamified productivity application. It is built with **Hono**, **Drizzle ORM**, and **SQLite**.

## Prerequisites

- Node.js (v18 or higher)
- npm

## Setup & Installation

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Copy the example environment file and configure it:
    ```bash
    cp .env.example .env
    ```
    _(Note: For local SQLite development, default settings usually work out of the box)._

## Database Initialization

We use **Drizzle ORM** with SQLite. The database schema is defined in `src/db/schema.ts`.

To initialize the database (create tables and apply schema changes):

```bash
npx drizzle-kit push
```

This command will:

1.  Read the schema from `src/db/schema.ts`.
2.  Create the `local.db` SQLite file if it doesn't exist.
3.  Apply any pending schema changes seamlessly.

> **Note:** If you encounter file lock issues on Windows, ensure no other processes (like a running server) are accessing `local.db`. You may need to stop the server (`Ctrl+C`) before running migration commands.

## Running the Server

- **Development Mode** (with hot reload):

  ```bash
  npm run dev
  ```

  Server will start at `http://localhost:3000`.

- **Production Build**:
  ```bash
  npm run build
  npm start
  ```

## Project Structure

- `src/index.ts`: Application entry point.
- `src/db/`: Database configuration and schema.
- `src/modules/`: Feature modules (auth, tasks, gamification).
- `src/middlewares/`: Global middlewares (auth, error handling).

## API Documentation

The API generally follows RESTful principles.

- `POST /auth/register`: Create a new account.
- `POST /auth/login`: Authenticate and receive a JWT.
- `GET /tasks`: List tasks.
- `POST /tasks`: Create a task.
