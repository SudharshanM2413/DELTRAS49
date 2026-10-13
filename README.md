# DELTRAS49

DELTRAS49 is a Next.js storefront backed by Prisma and PostgreSQL.

## Requirements

- Node.js 18 or newer
- npm
- A PostgreSQL database

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root. At minimum, configure:

   ```dotenv
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/DATABASE?pgbouncer=true"
   DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
   JWT_SECRET="replace-with-a-long-random-secret"
   ```

   Replace the PostgreSQL URL placeholders with your database connection details. Use the pooled URL for `DATABASE_URL` and the direct URL for `DIRECT_URL`. `.env.example` documents the supported variables; keep real secrets out of source control.

3. Generate the Prisma client, create/update the PostgreSQL schema, and seed demo records:

   ```bash
   npm run db:setup
   ```

   The seed command is safe to rerun: it updates its demo users and products and will not clear existing users, products, or orders.

4. Start the development server:

   ```bash
   npm run dev
   ```

The demo accounts are `admin@threadcraft.com` / `admin123` and `john@example.com` / `customer123`. Change these credentials before exposing a seeded database to anyone else.

## Database commands

- `npm run db:generate` regenerates the Prisma client.
- `npm run db:push` applies the Prisma schema to the configured database.
- `npm run db:seed` inserts or updates the demo records.
- `npm run db:studio` opens Prisma Studio.
- `npm run build` checks the production build.

`DATABASE_URL` controls which database Prisma modifies. Back up important data before changing the schema or running setup against a non-development database.
