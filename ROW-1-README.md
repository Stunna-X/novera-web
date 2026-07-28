# Novera Frontend — Row 1 Foundation

This bundle is designed to be copied into the existing `novera-web` Vite project.

## Included

- React Router v7 declarative routing
- Login and registration screens
- Access/refresh token handling
- Automatic token refresh and one-time 401 retry
- Protected and public-only routes
- Responsive dashboard layout
- Sidebar and top navigation
- Abuja operations dashboard shell
- Jobs, customers, teams, equipment, inventory, and settings route foundations

## Install/check dependencies

From `C:\Users\HomePC\PycharmProjects\novera-web`:

```powershell
npm install react-router lucide-react
npm install -D tailwindcss @tailwindcss/vite
```

## Environment

Create `.env` from `.env.example`:

```powershell
Copy-Item .env.example .env
```

Default backend URL:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PREFIX=/api/v1
```

## Run

```powershell
npm run dev
```

Backend CORS should allow `http://localhost:5173`.
