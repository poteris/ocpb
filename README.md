# 🚀 Getting Started with Rep Coach

This guide will help you set up the Rep Coach project locally.

## Prerequisites

- Node.js (v18 or later)
- pnpm
- OpenAI API key
- Docker (for local Supabase)

## 📝 Installation and Setup

1. Clone the repository:

```bash
git clone https://github.com/poteris/ocpb.git
cd ocpb
```

2. Create environment configuration:

   Create a `.env` file in the root directory with:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
OPENAI_API_KEY=your_openai_key_here
```

3. Install the project dependencies:

```bash
pnpm install
```

4. Start the local Supabase instance:

```bash
pnpm db:start
```

Important notes:

- If Supabase is already running locally, stop it first: `pnpm db:stop`
- To completely reset the database: `pnpm db:reset:all` (⚠️ This will erase all data)

5. Launch the application:

```bash
pnpm dev
```
This command starts the Next.js development server which offers hot reloading

6. Smoke test the application with Playwright E2E tests:

- Before first run, install playwright browsers and set the host and port of your dev server:
```bash
pnpm exec playwright install --with-deps
echo E2E_TEST_BASE_URL=http://localhost:3000 >> ./frontend/.env
```
- Then to execute the E2E smoke test suite:
```bash
pnpm dev && pnpm test:ui
```
- There is also a github action that invokes the Playwright E2E smoke test suite for a given branch, when the associated PR is marked as Ready for Review

## 🏗️ Architecture Overview

- **Supabase**: Database and authentication
- **Supabase.js**: For Supabase client and database operations
- **AI Integration**: OpenAI's API for language model capabilities
- **Frontend and Backend Framework**: Next.js for server-side rendering and API routes
- **State Management**: Jotai for global React state management
- **Zod**: For data validation and schema definition
- **UI Components**: TailwindCSS with Shadcn for consistent styling

## Pages

- **Home**
- **Scenarios**
- **Chat**
- **Admin**
- **Organiser Admin**

## 🛣️ Development Roadmap

Immediate focus areas include:

1. Enhanced Error Handling

   - Implementing comprehensive error boundaries
   - Improving error reporting and recovery
   - Implementing robust error handling in the UI
   - Implement loggers and monitoring

2. Testing

   - More test coverage

3. Backend Architecture

   - Transitioning to tRPC for type-safe API calls

4. UI Enhancement

   - Implementing Figma designs
   - Ensuring consistent user experience

5. Authentication

   - Implementing user authentication
   - Ensuring secure access to the application

6. Database

   - Implementing database migrations
   - Remove hardcoded data which is pushed to db on startup
   - Implementing RLS (with auth)

7. AI

   - Add more LLM models

## 💡 Contributing

We welcome contributions! Before submitting changes, please:

1. Ensure your code follows our styling conventions
2. Write tests for new features
3. Update documentation as needed

For major changes, please open an issue first to discuss your proposed modifications.

## 🔧 Helpful Commands

- `pnpm db:start` - Launch Supabase locally
- `pnpm db:stop` - Stop Supabase instance
- `pnpm db:reset:all` - Reset database (⚠️ destructive)
- `pnpm start` - Start development server
- `pnpm test` - Run test suite
- `pnpm test:ui` - Run Playwright E2E smoke test suite

For additional assistance or questions, please check our issue tracker or reach out to the development team.
