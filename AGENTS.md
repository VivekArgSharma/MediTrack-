# MediTrack+ — Agent Instructions

## Project Overview

MediTrack+ is a real-time healthcare monitoring system:
- **Backend**: FastAPI (Python) on `localhost:8000`. ESP32 sends serial data → backend → Supabase
- **Frontend**: React 18 + Vite + TypeScript on `localhost:5173`, proxied via Vite to backend
- **Database**: Supabase (Postgres) for storing vitals batches and generated reports
- **AI Reports**: Gemini 1.5 Flash generates health reports from 20-second data batches

## Project Structure

```
D:\mysore-hackathon\
├── backend/                    # FastAPI backend (run from this dir)
│   ├── app/
│   │   ├── api/routes.py       # REST endpoints (/api/vitals, /api/reports, etc.)
│   │   ├── api/websocket.py    # WebSocket stream (/ws/vitals)
│   │   ├── core/config.py      # Pydantic Settings (.env config)
│   │   ├── data_sources/       # simulator.py (fake data), serial_port.py (ESP32)
│   │   ├── schemas/health.py   # Pydantic models (VitalReading, VitalEnvelope, etc.)
│   │   └── services/
│   │       ├── supabase_client.py  # Custom httpx REST client (NO supabase SDK)
│   │       ├── report_generator.py # 20-sec batching → Gemini/fallback → Supabase
│   │       ├── gemini_service.py    # Gemini 1.5 Flash + rule-based fallback
│   │       ├── runtime.py           # MonitorRuntime streams data, calls report_generator
│   │       ├── ai_analysis.py      # generate_insight() rule-based
│   │       ├── alerts.py           # evaluate_alerts(), derive_status()
│   │       └── parser.py           # parse_raw_vitals()
│   ├── .env                    # Credentials (NEVER commit)
│   └── requirements.txt
└── frontend/                   # React/Vite/TypeScript frontend
    └── src/
        ├── App.tsx             # React Router (Layout wraps all routes)
        ├── pages/
        │   ├── Dashboard.tsx    # Home page (local DATA_STREAM simulation)
        │   ├── Reports.tsx     # Report grid + Generate button with 20s countdown
        │   └── ReportView.tsx  # Single report detail page
        ├── components/layout/   # Layout.tsx (200px sidebar + Outlet)
        ├── hooks/
        │   ├── useReports.ts   # fetchReports(), generate(), secondsUntilReady
        │   └── useHealthData.ts # No-op stub (backend polling not connected)
        ├── services/api.ts     # REST fetch helpers
        ├── store/index.ts      # Zustand store
        ├── types/health.ts     # TypeScript types (VitalReading, VitalEnvelope, etc.)
        └── styles.css          # All CSS (dashboard + sidebar + reports)
```

## How to Run

### Backend
```bash
cd D:\mysore-hackathon\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- Run from `D:\mysore-hackathon\backend` directory specifically — Python may resolve `app` from a different directory (e.g., `D:\Atlas\backend`) if run from parent dirs
- Backend lifespan: starts `runtime` + `report_generator`, runs migration thread

### Frontend
```bash
cd D:\mysore-hackathon\frontend
npm run dev
```
- Vite proxy: `/api` → `http://127.0.0.1:8000`, `/ws` → `ws://127.0.0.1:8000`
- Open `http://localhost:5173`

## Build Commands

### Frontend
```bash
npm run dev          # Start dev server (port 5173)
npm run build        # TypeScript check + Vite build (tsc -b && vite build)
npm run preview      # Preview production build
```

### Backend
```bash
# No formal test suite. Verify manually:
curl http://localhost:8000/api/ping
curl http://localhost:8000/api/reports/history
curl http://localhost:8000/api/vitals/history
# Start with verbose output:
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --log-level debug
```

## Code Style

### Python (Backend)
- **Imports**: Always use `app.` prefixed absolute imports (e.g., `from app.core.config import settings`). Never use `from . import` relative imports inside the `app` package.
- **Types**: Use type hints on all function signatures. Use `None` union (`str | None`) not `Optional[str]`.
- **Async**: All I/O (HTTP, file, asyncio) must be async. Never use `time.sleep()` in async context.
- **Classes**: Use `__slots__` for high-frequency classes (e.g., `TableProxy`, `QueryBuilder`). Use Pydantic models for all data schemas.
- **Naming**: `snake_case` for functions/variables, `PascalCase` for classes/types. Private helpers prefixed with `_`.
- **Error handling**: Never swallow exceptions silently in API routes. Use `try/except` with specific return types. Report generator catches internally but API should surface meaningful errors.
- **Supabase**: DO NOT use the `supabase` Python SDK. Use the custom `httpx`-based `table()` client in `app.services.supabase_client`. Import it as: `from app.services.supabase_client import table`.
- **Gemini**: Import as `import google.generativeai as genai`. Configure with `genai.configure(api_key=...)`. Use `genai.GenerativeModel("gemini-1.5-flash")`. Call with `await model.generate_content_async(prompt)`.
- **No comments**: Do not add comments to code unless explicitly requested.

### TypeScript (Frontend)
- **Imports**: Use named imports. Barrel exports from `pages/Reports.tsx` (`export interface ReportSummary`).
- **Types**: All API response types should use optional fields (`?`) with fallback defaults. Never assume a field exists — use optional chaining (`m.hr?.avg ?? '—'`).
- **React**: Use functional components with hooks. Use `useCallback` for any function passed as a prop. Always clean up intervals/subscriptions in `useEffect` return.
- **Styling**: CSS uses BEM-ish class names (`.report-card__header`, `.metric-tile__avg`). All styles live in `src/styles.css` — no inline styles or CSS modules.
- **Routing**: Use React Router v7. `Layout` component renders sidebar + `<Outlet />`. No nested layouts needed.
- **No comments**: Do not add comments to code unless explicitly requested.

## Key Patterns

### Supabase REST calls
```python
from app.services.supabase_client import table
result = table("reports").select("id,health_score").order("generated_at", desc=True).limit(5).execute()
```

### Report Generator (20-sec batching)
```python
report_generator.record(vitals.model_dump())  # called from runtime._stream() every tick
report = await report_generator.generate()     # manually trigger, returns None if buffer empty
```

### Frontend API calls
```typescript
const res = await fetch(`${API_BASE}/reports/history`);
const data = await res.json();
if (Array.isArray(data)) { setReports(data); }
```

## Critical Rules

1. **NEVER commit `.env` files** — they contain `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY` (service role), `SUPABASE_SERVICE_KEY`
2. **Backend runs on user's laptop** at `localhost:8000` — always online when frontend is used
3. **Serial port**: Backend reads from `settings.serial_port` (default `COM3`). When `settings.data_source == "serial"`, use `SerialPortReader`. Default is `FakeDataGenerator`.
4. **No `supabase` Python SDK** — conflicts with httpx. Use the custom `table()` client only.
5. **Port conflicts**: If port 8000 is in use, `netstat -ano | findstr :8000` to find and kill the PID.
6. **Vite proxy**: Works only when frontend dev server is running. Backend URL must be `http://127.0.0.1:8000` (not `localhost` in some configs).

## Environment Variables

### Backend `.env`
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=<service_role_jwt>
SUPABASE_SERVICE_KEY=<pat_for_management_api>
GEMINI_API_KEY=<google_gemini_key>
BATCH_INTERVAL_SECONDS=20
```

### Frontend `.env` (optional)
```
VITE_API_BASE_URL=/api  # default, don't change unless backend runs elsewhere
```