# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Supabase Integration**: Migrated backend infrastructure entirely to Supabase. This provides secure, seamless PostgreSQL interaction, real-time database subscriptions, and managed authentication.
- **New UI Components**: Introduced fresh, premium React components employing glassmorphism, specialized layouts, and deeply integrated Tailwind CSS v4 aesthetic rules.
- **Documentation**: Added comprehensive `CHANGELOG.md` and overhauled `README.md` to guide new developers and AI agents through the simplified repository architecture. 

### Changed
- **Authentication**: Stripped out previous custom JWT/auth middleware setups. All login/sign-up flows and protected routing are now fundamentally tied to `@supabase/supabase-js`.
- **Database Access**: Relocated all application state and persistence code to run client-side requests against Supabase rather than hitting custom Express.js endpoints. Let Row Level Security (RLS) policies handle authorization.
- **Frontend Architecture**: Refactored major user-facing pages including Onboarding, Sign-in, Sign-up, Landing, and Dashboard subsets to reflect the overhauled state management and design principles.

### Removed
- **Custom Backend**: Completely sunsetted the local Express Server, legacy Hono routing, custom Mongoose Models/MQL logic, and local Websocket implementations in favor of Supabase's managed real-time and REST/GraphQL APIs.
