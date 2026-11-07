# DecorOnDemand

This React app uses Vite for development and server-side rendering.

## Commands

- `npm run dev` starts the SSR development server with Vite HMR.
- `npm run build` creates the browser and SSR bundles.
- `npm start` serves the production SSR build.

## Database

The server creates the `decorondemand` MySQL database and its `users` table on
startup when they do not already exist. Copy `.env.example` to `.env` and set
your MySQL connection values before starting the server.

`POST /api/users` accepts `{ "name": "...", "email": "...", "password": "..." }`. Passwords
are stored as bcrypt hashes and are never returned by the endpoint.

The server renders the initial HTML with React on every request. The browser then
hydrates that markup using `src/main.jsx`, so existing interactive components
continue to work after the first page load.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
