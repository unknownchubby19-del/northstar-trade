# Connect Supabase to Northstar

1. Create a Supabase project at [supabase.com](https://supabase.com/).
2. In the Supabase dashboard, go to **Project Settings → API** and copy your **Project URL** and **publishable key** (or legacy `anon` key). Do not use the `service_role` or a secret key in this frontend.
3. In the VS Code terminal, change to the `My-project` folder and create your local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Open `.env` and replace the example values:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   If your project only shows the legacy `anon` key, use it as the value for `VITE_SUPABASE_PUBLISHABLE_KEY`, or name the variable `VITE_SUPABASE_ANON_KEY`. Do not enter a `service_role` or secret key.

5. In Supabase, go to **Authentication → URL Configuration** and allow your local Vite URL, usually `http://localhost:5173`.
6. Start the app from `My-project`:

   ```powershell
   npm run dev
   ```

   Restart the Vite server after changing `.env` so the new values are loaded. The dashboard's **Sign in** and **Sign up** forms now use Supabase Auth; when email confirmation is enabled, confirm the email before signing in.

## Optional: link the Supabase CLI

The CLI link is for managing Supabase migrations and project configuration from this folder. It does not configure the app's browser connection; complete the `.env` steps above as well.

In the VS Code PowerShell terminal, run each command separately from the `My-project` folder:

```powershell
npm install --save-dev supabase
npx supabase init
npx supabase login
npx supabase link --project-ref your-project-ref
```

Replace `your-project-ref` with the project reference shown in your Supabase dashboard (the part before `.supabase.co` in the project URL). `login` opens a browser or asks you to authenticate. `link` may prompt for the database password from the Supabase project; it is not your Supabase account password. Do not share your access token or database password.

## Set up the leaderboard

In the Supabase dashboard, open **SQL Editor**, paste and run the contents of [`supabase/leaderboard.sql`](./supabase/leaderboard.sql). This creates the leaderboard table, enables authenticated read-only access, and adds sample scores only if the table is empty. After signing in, open **Leaderboard** in the app navigation and use **Refresh** to reload scores. Scores are managed in Supabase; the app currently displays them but does not submit or change scores.

The `.env` file is ignored by Git. The browser Supabase key is public by design; secure database tables with Row Level Security policies. Never expose a `service_role` or secret key in frontend code.
