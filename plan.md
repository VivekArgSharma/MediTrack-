# AI-Powered Real-Time Healthcare Monitoring System
## Architectural & Implementation Plan

This document outlines the architecture, technology stack, and step-by-step implementation plan for a real-time healthcare monitoring dashboard. It is designed to start with simulated data and seamlessly transition to physical ESP32 hardware without altering the frontend or core business logic.

---

### 1. Full Project Folder Structure

A monorepo structure is recommended for ease of development and sharing configurations.

```text
healthcare-monitoring/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── api/
│   │   │   ├── routes.py        # REST API endpoints
│   │   │   └── websocket.py     # WebSocket endpoints
│   │   ├── core/
│   │   │   └── config.py        # Environment variables & config
│   │   ├── models/
│   │   │   └── database.py      # ORM/Database schema models
│   │   ├── schemas/
│   │   │   └── health.py        # Pydantic models for validation (JSON shape)
│   │   ├── services/
│   │   │   ├── parser.py        # Parsing serial/string data to JSON
│   │   │   ├── ai_analysis.py   # LLM interaction layer
│   │   │   └── alerts.py        # Anomaly & threshold detection
│   │   ├── data_sources/
│   │   │   ├── base.py          # Abstract base class for data sources
│   │   │   ├── simulator.py     # FakeDataGenerator
│   │   │   └── serial_port.py   # ESP32 integration (future)
│   │   └── db/
│   │       └── connection.py    # Database connection setup
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/       # Dashboard specific components
│   │   │   │   ├── VitalsCard.tsx
│   │   │   │   ├── RealTimeChart.tsx
│   │   │   │   ├── AlertsPanel.tsx
│   │   │   │   └── AiAnalysisPanel.tsx
│   │   │   ├── layout/
│   │   │   └── shared/
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts  # Custom hook for real-time connection
│   │   │   └── useHealthData.ts # Data management logic
│   │   ├── pages/
│   │   │   └── Dashboard.tsx
│   │   ├── services/
│   │   │   └── api.ts           # REST API client logic
│   │   ├── store/
│   │   │   └── index.ts         # Zustand state management
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tailwind.config.js
└── docker-compose.yml
```

---

### 2. Backend Architecture

The backend will be built with **Python FastAPI** to handle both high-performance REST APIs and asynchronous WebSockets concurrently.

- **Data Source Layer**: Uses an abstraction (`DataSource` Base Class) so `FakeDataGenerator` can be easily swapped for `SerialPortReader` by simply changing an environment variable.
- **Parsing Layer**: Takes raw strings (`HR:78,SpO2:98...`), splits them, and maps them to strongly-typed **Pydantic models** ensuring the output is perfectly formatted JSON.
- **Service Layer**: 
    - **Alerts System**: Continuously checks parsed data against thresholds (e.g., HR > 100, SpO2 < 90, Fall == 1).
    - **AI Analysis**: Collects a rolling window of data and periodically (or on-demand) prompts an LLM for health summaries and predictive insights.
- **API/WebSocket Layer**: Broadcasts the parsed JSON data and active alerts to connected frontend clients immediately after parsing.

---

### 3. Frontend Architecture

Built with **React (Vite) + TypeScript** for maximum performance and developer experience.

- **UI & Aesthetics**: TailwindCSS for styling. The goal is a dark, futuristic healthcare theme utilizing subtle neon accents (cyan/purple), glassmorphism panels, and smooth Framer Motion micro-animations to indicate active monitoring.
- **Charts**: Recharts (or Chart.js) optimized for real-time rendering. The charts will feature smooth trailing lines for HR, SpO2, and Temperature.
- **Real-Time Data Flow**: A centralized `useWebSocket` hook maintains a persistent connection to the backend, catching JSON payloads and dispatching them to the global state.
- **Component Design**: Modular components for each vital sign, ensuring that high-frequency updates only re-render the necessary DOM nodes.

---

### 4. Database Schema

Using **PostgreSQL** (with the TimescaleDB extension recommended for optimal time-series querying) or **MongoDB**. Assuming a relational model:

```sql
-- Main Vitals Table
CREATE TABLE patient_vitals (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    heart_rate INTEGER,
    spo2 INTEGER,
    temperature DECIMAL(4, 2),
    steps INTEGER,
    fall_detected BOOLEAN,
    motion VARCHAR(50),
    battery INTEGER
);

-- Alerts Log
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    alert_type VARCHAR(50), -- e.g., 'FALL', 'HIGH_HR'
    severity VARCHAR(20),   -- e.g., 'WARNING', 'CRITICAL'
    message TEXT,
    resolved BOOLEAN DEFAULT FALSE
);

-- AI Generated Insights
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    summary TEXT,
    recommendations TEXT,
    anomaly_detected BOOLEAN
);
```

---

### 5. WebSocket Design

WebSockets are crucial for the 1-second interval real-time updates.

- **Endpoint**: `ws://localhost:8000/ws/vitals`
- **Data Flow**:
  1. Frontend connects to the WebSocket endpoint.
  2. Backend starts reading from the active `DataSource` (Simulator or ESP32).
  3. Backend parses the string to JSON, evaluates alerts, and saves to DB.
  4. Backend sends the compiled JSON payload to all connected clients.
- **Expected Payload**:
```json
{
  "type": "vital_update",
  "data": {
    "HR": 78,
    "SpO2": 98,
    "Temp": 36.8,
    "Steps": 1240,
    "Fall": 0,
    "Motion": "Walking",
    "Battery": 82
  },
  "alerts": [
    { "type": "High HR", "severity": "Warning", "message": "Heart rate is slightly elevated." }
  ],
  "status": "Warning" // Stable | Warning | Critical
}
```

---

### 6. API Routes

- `GET /api/vitals/history` - Fetch the last N minutes of data to populate charts on initial page load.
- `GET /api/alerts` - Fetch active and historical alerts for the Event Timeline.
- `POST /api/ai/analyze` - Trigger an immediate LLM analysis of the current data window.
- `GET /api/ai/latest` - Retrieve the most recently generated AI health summary.

---

### 7. State Management Approach

- **Tool**: **Zustand** is highly recommended over Redux or Context API for this project. It is lightweight, fast, and handles high-frequency state updates efficiently without causing unnecessary prop-drilling re-renders.
- **State Shape**:
  - `currentVitals`: The absolute latest reading (updates every second).
  - `historicalData`: Array of the last 60-120 readings for the charts. As new data arrives, it is appended to the end, and the oldest reading is shifted out.
  - `activeAlerts`: Array of currently unresolved alerts.
  - `aiSummary`: Data object containing the latest LLM response.

---

### 8. Recommended Libraries

**Backend**:
- `fastapi` & `uvicorn` - Core API/WS server.
- `pydantic` - Enforcing the incoming hardware string into structured JSON.
- `pyserial` - For reading the COM port when switching to the ESP32.
- `asyncpg` / `SQLAlchemy` - Non-blocking database interaction.
- `langchain` / `openai` - Preparing the architecture for LLM workflows.

**Frontend**:
- `react`, `vite`, `typescript`
- `tailwindcss`, `lucide-react` - Styling & Healthcare Icons.
- `recharts` - Optimized, responsive charts.
- `zustand` - State management.
- `framer-motion` - Crucial for the dynamic, alive feel of a premium dashboard (flashing alerts, pulsing heart rate icons).
- `react-use-websocket` - Robust hook for maintaining WS connections and auto-reconnecting.

---

### 9. Step-by-Step Implementation Plan

**Phase 1: Backend Foundation & Simulator**
1. Initialize FastAPI project.
2. Build the `DataSource` abstraction.
3. Implement `FakeDataGenerator` to yield the exact required string format every second.
4. Implement the Parsing logic to convert strings to Pydantic models.
5. Create the WebSocket endpoint to stream the parsed JSON.

**Phase 2: Frontend UI & Real-Time Connection**
1. Initialize Vite React project with Tailwind.
2. Establish the dark futuristic design system (CSS variables, layout).
3. Connect `useWebSocket` hook to FastAPI.
4. Build `VitalsCard` and feed live JSON into the UI.
5. Implement `RealTimeChart` for HR, SpO2, and Temp.

**Phase 3: Database & History**
1. Spin up PostgreSQL via Docker.
2. Update backend to asynchronously write incoming vitals to the DB.
3. Implement REST APIs for historical data fetching.

**Phase 4: Alerts & AI Prep**
1. Implement hardcoded thresholds in backend (e.g., `Fall == 1`).
2. Broadcast alerts via WebSocket and update the Patient Status Indicator (Stable -> Critical).
3. Build the Frontend Event Timeline & AI Analysis placeholder panels.
4. Setup REST route for LLM prompting.

**Phase 5: ESP32 Hardware Integration**
1. Write `SerialPortReader` class inheriting from `DataSource` using `pyserial`.
2. Update backend configuration to switch data source via `.env`.
3. Test physical hardware stream (frontend remains exactly the same).

---

### 10. Scalable Production-Ready Architecture

When scaling this system for multiple patients or high loads:
- **Message Broker**: Introduce **Redis Pub/Sub** or RabbitMQ. The `DataSource` service publishes to Redis, and multiple FastAPI worker nodes subscribe and broadcast to their connected WebSocket clients.
- **Time-Series DB**: Use **TimescaleDB** or **InfluxDB** instead of standard Postgres for highly efficient time-series writes and aggregation queries.
- **Background Workers**: Use **Celery** or **RQ** to offload heavy AI/LLM analysis tasks so they don't block the real-time event loop.
- **Deployment**: Containerize the Frontend, Backend, DB, and Redis using Docker Compose, paving the way for Kubernetes deployment.
