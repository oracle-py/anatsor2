# Next.js

A modern Next.js 15 application built with TypeScript and Tailwind CSS.

## AIPMS setup

1. Copy `.env.example` to `.env.local` and add the Supabase project URL and anon key.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. In Supabase Authentication, set the site URL and redirect URLs for the deployed domain.
4. Create an account at `/signup`; its device ID must match the ID published by the Arduino/MQTT bridge.

The Arduino MQTT message shape is documented in `../backend/MQTT_PAYLOAD.md`.

## Multi-farm demo (Youth4Climate, 15 farms)

1. Run `supabase/schema.sql`, then create the admin account in Supabase (Authentication → Users → Add user).
2. Put that email into `supabase/seed_farms.sql` (replace `REPLACE_WITH_ADMIN_EMAIL`) and run it in the SQL editor.
   It adds farm columns to `devices`, upserts the 15 farms for the admin, and backfills 7 days of readings.
   Re-run it any time to refresh the history up to "now".
3. Sign in as the admin: `/farms` shows all deployments, and each card opens `/dashboard?farm=<device id>`.

Live values are simulated in the browser by `src/lib/simulation.ts` (a deterministic function of farm and time,
updated every 5 seconds). The SQL seed uses the same formulas, so stored history and live values line up.
Pages carry a "Demo data" badge.

## 🚀 Features

- **Next.js 15** - Latest version with improved performance and features
- **React 19** - Latest React version with enhanced capabilities
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development

## 🛠️ Installation

1. Install dependencies:
  ```bash
  npm install
  # or
  yarn install
  ```

2. Start the development server:
  ```bash
  npm run dev
  # or
  yarn dev
  ```
3. Open [http://localhost:4028](http://localhost:4028) with your browser to see the result.

## 📁 Project Structure

```
nextjs/
├── public/             # Static assets
├── src/
│   ├── app/            # App router components
│   │   ├── layout.tsx  # Root layout component
│   │   └── page.tsx    # Main page component
│   ├── components/     # Reusable UI components
│   ├── styles/         # Global styles and Tailwind configuration
├── next.config.mjs     # Next.js configuration
├── package.json        # Project dependencies and scripts
├── postcss.config.js   # PostCSS configuration
└── tailwind.config.js  # Tailwind CSS configuration

```

## 🧩 Page Editing

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## 🎨 Styling

This project uses Tailwind CSS for styling with the following features:
- Utility-first approach for rapid development
- Custom theme configuration
- Responsive design utilities
- PostCSS and Autoprefixer integration

## 📦 Available Scripts

- `npm run dev` - Start development server on port 4028
- `npm run build` - Build the application for production
- `npm run start` - Start the development server
- `npm run serve` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## 📱 Deployment

Build the application for production:

  ```bash
  npm run build
  ```

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

You can check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🙏 Acknowledgments

- Built with [Rocket.new](https://rocket.new)
- Powered by Next.js and React
- Styled with Tailwind CSS

Built with ❤️ on Rocket.new

## Local development performance

Use Node.js 22 (`nvm use` in this directory), then run `npm run dev`.
Development uses Turbopack. `npm run dev:webpack` is available for compatibility.
The UI uses system fonts, so compilation does not download Google Fonts.
Optional Rocket component tagging is disabled; enable it for the Webpack
preview with `ENABLE_COMPONENT_TAGGER=true npm run dev:webpack`.
Stop and restart the server after changing the development configuration.
