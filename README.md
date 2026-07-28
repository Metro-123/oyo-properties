# OyoProperties

A React, Vite and Tailwind CSS property-listing website originally exported from Figma Make.

## Run locally

1. Install the current **Node.js LTS** release from https://nodejs.org/ and close/reopen your terminal afterwards.
2. Open PowerShell in this project folder.
3. Run `npm install` once.
4. Run `npm run dev`.
5. Open the local address printed in the terminal, normally `http://localhost:5173`.

To stop the server, press `Ctrl + C` in the same terminal.

## Backend note

The supplied project uses a Supabase backend that was created for Figma Make. The front end will start locally, but listings, login, registration and contact forms need that Supabase project to remain available over the internet.

When moving the site to your own Supabase project, copy `.env.example` to `.env`, enter your own values, then restart `npm run dev`. Never commit `.env` to a public repository.

## Production check

Run `npm run build` before deploying. For a static hosting provider, configure an SPA fallback so all routes are served by `index.html`; otherwise direct visits to pages such as `/properties` can return a 404.
