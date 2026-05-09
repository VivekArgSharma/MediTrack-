import httpx

from app.core.config import settings


def ensure_tables() -> None:
    if not settings.supabase_url or not settings.supabase_key:
        print("Supabase not configured, skipping migration.")
        return

    ref = settings.supabase_url.rstrip("/").split("/")[-1]
    if not settings.supabase_service_key:
        print("SUPABASE_SERVICE_KEY not set, skipping migration.")
        return

    headers = {
        "Authorization": f"Bearer {settings.supabase_service_key}",
        "apikey": settings.supabase_service_key,
        "Content-Type": "application/json",
    }

    ddl = """CREATE TABLE IF NOT EXISTS vitals_batches (
      id uuid default gen_random_uuid() primary key,
      recorded_at timestamptz default now(),
      hr_data jsonb not null default '{"timestamps":[],"values":[]}',
      spo2_data jsonb not null default '{"timestamps":[],"values":[]}',
      temp_data jsonb not null default '{"timestamps":[],"values":[]}',
      fall_data jsonb not null default '{"timestamps":[],"values":[]}',
      motion_data jsonb not null default '{"timestamps":[],"values":[]}',
      batch_size int default 0
    );
    CREATE TABLE IF NOT EXISTS reports (
      id uuid default gen_random_uuid() primary key,
      generated_at timestamptz default now(),
      text_summary text not null default '',
      health_score int default 0,
      risk_level text default 'Low',
      recommendations text[] default '{}',
      metrics_summary jsonb default '{}'
    );"""

    payload = {"query": ddl}

    try:
        with httpx.Client(timeout=30) as client:
            resp = client.post(
                f"https://api.supabase.com/v1/projects/{ref}/database/query",
                headers=headers,
                json=payload,
            )
            if resp.status_code not in (200, 201):
                print(f"Supabase migration failed: {resp.status_code} {resp.text}")
            else:
                print("Supabase tables created successfully.")
    except Exception as e:
        print(f"Supabase migration error: {e}")