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
    Key variables:
    | Variable | Description | Default |
    |---|---|---|
    | `DATABASE_URL` | Path to SQLite database file | `local.db` |
    | `JWT_SECRET` | Secret for signing JWT tokens | _(required)_ |
    | `PORT` | Server port | `3000` |

## Database Initialization

We use **Drizzle ORM** with SQLite. The database schema is defined in `src/db/schema.ts`.

### First-time Setup

Run the init script to create the database and all tables:

```bash
npm run db:init
```

### Available Database Scripts

| Script      | Command             | Description                                     |
| ----------- | ------------------- | ----------------------------------------------- |
| `db:init`   | `npm run db:init`   | Create database & tables from scratch           |
| `db:push`   | `npm run db:push`   | Push schema changes (after editing `schema.ts`) |
| `db:studio` | `npm run db:studio` | Open Drizzle Studio to browse data              |

> **Note:** If you encounter file lock issues on Windows, ensure no other processes (like a running server) are accessing the database. You may need to stop the server (`Ctrl+C`) before running database commands.

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
