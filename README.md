# Sceneblikk Monorepo

This is a monorepo containing both the Sceneblikk web application and website.

## Structure

```
sceneblikk_app_2/
├── apps/
│   ├── webapp/     # Main Sceneblikk application (Next.js with TypeScript)
│   └── web/        # Sceneblikk website (Next.js with JavaScript)
└── package.json    # Root package.json with workspace configuration
```

## Getting Started

### Install Dependencies

From the root directory, run:

```bash
npm install
```

This will install all dependencies for both workspaces.

### Development

To run the development server for a specific app:

```bash
# Run webapp (main application)
npm run dev:webapp

# Run web (website)
npm run dev:web
```

**Note:** To run both simultaneously, you'll need to open two terminal windows, or use a tool like `concurrently`:

```bash
npm install -g concurrently
concurrently "npm run dev:webapp" "npm run dev:web"
```

### Building

Build all apps:

```bash
npm run build
```

Or build individually:

```bash
npm run build:webapp
npm run build:web
```

### Linting

Lint all apps:

```bash
npm run lint
```

Or lint individually:

```bash
npm run lint:webapp
npm run lint:web
```

## Workspaces

This monorepo uses npm workspaces. Each app in `apps/` is a separate workspace with its own `package.json`.

### Apps

- **webapp** (`apps/webapp/`): The main Sceneblikk application built with Next.js 15, React 19, TypeScript, and Firebase.
- **web** (`apps/web/`): The Sceneblikk marketing website built with Next.js 15 and React 18.

## Ports

- **webapp**: Runs on `http://localhost:3000` (default Next.js port)
- **web**: Runs on `http://localhost:3000` (default Next.js port)

**Note:** If running both simultaneously, you'll need to configure different ports. You can do this by setting the `PORT` environment variable or modifying the dev scripts in each app's `package.json`.

