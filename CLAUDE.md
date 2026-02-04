# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server with turbopack on http://localhost:3000
npm run build            # Build for production
npm run start            # Run production server
npm run lint             # Run ESLint

# Testing
npm test                 # Run vitest in watch mode
npm test -- --run        # Run tests once
npm test -- path/to/file # Run specific test file

# Database
npm run setup            # Install deps + generate Prisma client + run migrations
npm run db:reset         # Reset database (destroys all data)
npx prisma migrate dev --name <name>  # Create new migration
npx prisma generate      # Regenerate Prisma client after schema changes
```

## Architecture

### Overview

UIGen is an AI-powered React component generator. Users describe components in natural language, Claude generates the code using tool calls, and a live preview renders the result in-browser. All file operations happen in a virtual file system (no disk writes).

### Key Data Flow

1. User sends message → `/api/chat` endpoint
2. Vercel AI SDK streams Claude's response with tool calls (`str_replace_editor`, `file_manager`)
3. Tool calls execute against `VirtualFileSystem` instance
4. `FileSystemProvider` context triggers UI refresh
5. `PreviewFrame` transforms JSX via Babel and renders in sandboxed iframe
6. On completion, messages and file state are saved to SQLite via Prisma

### Core Modules

- **`src/lib/file-system.ts`** - `VirtualFileSystem` class: in-memory file tree with CRUD operations, serialization for database persistence. All paths start with `/`.

- **`src/lib/tools/str-replace.ts`** - AI tool for file editing: `view`, `create`, `str_replace`, `insert` commands. This is how Claude modifies the virtual filesystem.

- **`src/lib/tools/file-manager.ts`** - AI tool for `rename` and `delete` operations.

- **`src/lib/transform/jsx-transformer.ts`** - Babel-based JSX transformation. Creates import maps with blob URLs for local files and esm.sh URLs for npm packages. Generates preview HTML with Tailwind CDN.

- **`src/lib/provider.ts`** - Returns Anthropic Claude model if `ANTHROPIC_API_KEY` is set, otherwise returns `MockLanguageModel` for demo mode.

- **`src/lib/prompts/generation.tsx`** - System prompt instructing Claude to generate React components with Tailwind CSS, using `/App.jsx` as entry point.

### Contexts

- **`FileSystemProvider`** (`src/lib/contexts/file-system-context.tsx`) - Manages `VirtualFileSystem` instance, selected file state, and tool call execution.

- **`ChatProvider`** (`src/lib/contexts/chat-context.tsx`) - Wraps Vercel AI SDK's `useChat`, manages messages and streaming state.

### Routes

- `/` - Home page, redirects authenticated users to their latest project
- `/[projectId]` - Project editor (protected route)
- `/api/chat` - POST endpoint for AI streaming, saves results to database

### Database Schema (Prisma + SQLite)

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.

- **User**: `id`, `email`, `password` (bcrypt), timestamps
- **Project**: `id`, `name`, `userId?`, `messages` (JSON string), `data` (serialized VFS), timestamps

Projects can exist without a user (anonymous mode). The `messages` field stores the full chat history as JSON. The `data` field stores the serialized `VirtualFileSystem`.

### UI Component Structure

```
MainContent (3-panel layout)
├── ChatInterface (left panel)
│   ├── MessageList
│   └── MessageInput
└── Editor/Preview (right panel, tabbed)
    ├── PreviewFrame (sandboxed iframe)
    └── CodeEditor (Monaco) + FileTree
```

### Authentication

JWT-based auth with tokens stored in httpOnly cookies. See `src/lib/auth.ts` for session management and `src/actions/index.ts` for auth server actions.

## Tech Stack Notes

- **Next.js 15** with App Router and Turbopack
- **React 19** with server components
- **Tailwind CSS v4** (uses `@tailwindcss/postcss` plugin)
- **Vercel AI SDK 4.x** with `@ai-sdk/anthropic`
- **shadcn/ui** components in `src/components/ui/` (New York style)
- **Monaco Editor** for code editing
- **Babel standalone** for client-side JSX transformation

## Environment Variables

```
ANTHROPIC_API_KEY=sk-...  # Optional - falls back to mock mode without it
JWT_SECRET=...            # For auth tokens (has dev fallback)
```
