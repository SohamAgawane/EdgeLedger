# EdgeLedger — Frontend

TypeScript + React frontend for the EdgeLedger behavioral analytics platform.

## Tech Stack

React 18 · TypeScript · Tailwind CSS · Recharts · Framer Motion · Zustand · TanStack Query · React Hook Form · Zod

## Setup

```bash
npm install
cp .env .env.local   # set VITE_API_URL to your backend
npm run dev
```

Opens at http://localhost:5173

## Notes

- Dark/light theme toggles in the top navbar
- All API calls go to VITE_API_URL (default: http://localhost:8001/api/v1)
- Make sure the backend is running first
