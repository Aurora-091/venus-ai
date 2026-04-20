# Venus AI

Venus AI is a modern SaaS application built with a React + Vite frontend, Supabase for backend-as-a-service (authentication and database), Recoil for client state, and styled with Tailwind CSS v4.

## Structure

- `frontend/` - React + Vite application, routing, UI components, Recoil state, and configuration.
- `frontend/package.json` - Dependencies and build scripts for the frontend application.
- `docs/` - Project notes and planning documentation.

The backend infrastructure has been completely migrated to **Supabase**, eliminating the need for a separate custom backend server. Authentication, data persistence, and real-time updates are all handled securely through the Supabase client.

## Quick Start

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Configure environment variables. Copy the example file and populate it with your Supabase credentials:

```bash
cp .env.example .env
```

Ensure your `.env` contains the required Supabase keys:
```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Start the development server:

```bash
npm run dev
```

The application will be accessible at `http://127.0.0.1:5682`.

## Database Schema

The database schema and policies are provided in the repository to easily provision a new Supabase project. You can run the `backend/supabase_schema.sql` (or equivalent migration file if in use) directly in your Supabase SQL editor to set up the necessary tables, Row Level Security (RLS) policies, and database functions.

## Authentication

Authentication has been transitioned from custom JWT/Express implementation to native **Supabase Auth**. This provides out-of-the-box support for Email/Password, OAuth providers, and secure session management.

## Upstream Pull Request Notes

When opening a pull request against the original repository, use this repository's `work` branch as the source branch and include a short summary of the tenant, calling, and realtime updates included in your change set.

## Realtime Flow

The frontend connects directly to Supabase's Realtime infrastructure. Subscriptions to database changes update the React state (via Recoil atoms or component state) automatically, ensuring a seamless and synchronized user experience without local WebSocket boilerplate.

## Styling

This project uses **Tailwind CSS v4** via the `@tailwindcss/vite` plugin. Global aesthetics embrace a premium, modern design language (glassmorphism effects, dynamic gradients, deep dark themes).

Global base styles and Tailwind configuration are located in `frontend/src/styles.css`.
