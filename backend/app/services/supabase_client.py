import httpx

_project_url: str | None = None
_service_key: str | None = None
_static_client: httpx.Client | None = None


def _init() -> httpx.Client:
    global _project_url, _service_key, _static_client
    if _static_client is not None:
        return _static_client
    from app.core.config import settings
    _project_url = settings.supabase_url.rstrip("/")
    _service_key = settings.supabase_key
    _static_client = httpx.Client(
        base_url=f"{_project_url}/rest/v1",
        headers={
            "Authorization": f"Bearer {_service_key}",
            "apikey": _service_key,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        timeout=15,
    )
    return _static_client


def table(name: str) -> "TableProxy":
    return TableProxy(_init(), name)


class TableProxy:
    __slots__ = ("_client", "_name")

    def __init__(self, client: httpx.Client, name: str) -> None:
        self._client = client
        self._name = name

    def insert(self, data: dict) -> "Result":
        r = self._client.post(f"/{self._name}", json=data)
        if r.status_code >= 400:
            raise Exception(f"Insert failed {r.status_code}: {r.text}")
        return Result(r)

    def select(self, columns: str = "*") -> "QueryBuilder":
        return QueryBuilder(self._client, self._name).select(columns)

    def delete(self) -> "DeleteBuilder":
        return DeleteBuilder(self._client, self._name)


class QueryBuilder:
    __slots__ = ("_client", "_name", "_cols", "_filters", "_order_col", "_order_asc", "_limit_val")

    def __init__(self, client: httpx.Client, name: str) -> None:
        self._client = client
        self._name = name
        self._cols = "*"
        self._filters: list[tuple[str, str, str]] = []
        self._order_col: str | None = None
        self._order_asc = True
        self._limit_val: int | None = None

    def select(self, columns: str) -> "QueryBuilder":
        self._cols = columns
        return self

    def eq(self, column: str, value) -> "QueryBuilder":
        self._filters.append((column, "eq", str(value)))
        return self

    def in_(self, column: str, values: list) -> "QueryBuilder":
        vals = ",".join(str(v) for v in values)
        self._filters.append((column, "in", f"({vals})"))
        return self

    def order(self, column: str, desc: bool = False) -> "QueryBuilder":
        self._order_col = column
        self._order_asc = not desc
        return self

    def limit(self, n: int) -> "QueryBuilder":
        self._limit_val = n
        return self

    def execute(self) -> "Result":
        parts = [f"select={self._cols}"]
        if self._order_col:
            direction = "" if self._order_asc else ".desc"
            parts.append(f"order={self._order_col}{direction}")
        if self._limit_val:
            parts.append(f"limit={self._limit_val}")
        for col, op, val in self._filters:
            parts.append(f"{col}={op}.{val}")
        url = f"/{self._name}?{'&'.join(parts)}"
        r = self._client.get(url)
        if r.status_code >= 400:
            raise Exception(f"Query failed {r.status_code}: {r.text}")
        return Result(r)


class DeleteBuilder:
    __slots__ = ("_client", "_name", "_filters")

    def __init__(self, client: httpx.Client, name: str) -> None:
        self._client = client
        self._name = name
        self._filters: list[tuple[str, str, str]] = []

    def in_(self, column: str, values: list) -> "DeleteBuilder":
        vals = ",".join(str(v) for v in values)
        self._filters.append((column, "in", f"({vals})"))
        return self

    def execute(self) -> "Result":
        parts = [f"{col}={op}.{val}" for col, op, val in self._filters]
        url = f"/{self._name}?{'&'.join(parts)}"
        r = self._client.delete(url)
        if r.status_code >= 400:
            raise Exception(f"Delete failed {r.status_code}: {r.text}")
        return Result(r)


class Result:
    __slots__ = ("status_code", "data")

    def __init__(self, response: httpx.Response) -> None:
        self.status_code = response.status_code
        try:
            self.data = response.json() if response.text else []
        except Exception:
            self.data = []