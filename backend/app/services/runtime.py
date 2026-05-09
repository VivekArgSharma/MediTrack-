import asyncio
from collections import deque
from datetime import datetime, timezone

from app.core.config import settings
from app.data_sources.base import DataSource
from app.data_sources.serial_port import SerialPortReader
from app.data_sources.simulator import FakeDataGenerator
from app.schemas.health import AlertItem, Insight, VitalEnvelope
from app.services.ai_analysis import generate_insight
from app.services.alerts import derive_status, evaluate_alerts
from app.services.parser import parse_raw_vitals
from app.services.report_generator import report_generator


def get_data_source() -> DataSource:
    if settings.data_source == "serial":
        return SerialPortReader()
    return FakeDataGenerator()


class MonitorRuntime:
    def __init__(self) -> None:
        self.source = get_data_source()
        self.history: deque[VitalEnvelope] = deque(maxlen=settings.history_limit)
        self.alert_log: deque[AlertItem] = deque(maxlen=settings.alert_limit)
        self.latest_insight: Insight | None = None
        self.subscribers: set[asyncio.Queue[VitalEnvelope]] = set()
        self._task: asyncio.Task[None] | None = None
        self._running = False

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._stream())

    async def stop(self) -> None:
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def subscribe(self) -> asyncio.Queue[VitalEnvelope]:
        queue: asyncio.Queue[VitalEnvelope] = asyncio.Queue()
        self.subscribers.add(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue[VitalEnvelope]) -> None:
        self.subscribers.discard(queue)

    async def _broadcast(self, envelope: VitalEnvelope) -> None:
        for queue in list(self.subscribers):
            await queue.put(envelope)

    async def _stream(self) -> None:
        while self._running:
            raw = await self.source.read()
            vitals = parse_raw_vitals(raw)
            alerts = evaluate_alerts(vitals)
            status = derive_status(alerts)
            self.latest_insight = generate_insight(self.history)
            envelope = VitalEnvelope(
                timestamp=datetime.now(timezone.utc),
                data=vitals,
                alerts=alerts,
                status=status,
                insight=self.latest_insight,
            )
            self.history.append(envelope)
            for alert in alerts:
                self.alert_log.appendleft(alert)
            report_generator.record(vitals.model_dump())
            await self._broadcast(envelope)
            await asyncio.sleep(settings.stream_interval_seconds)


runtime = MonitorRuntime()
