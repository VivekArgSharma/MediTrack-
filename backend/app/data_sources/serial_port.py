import asyncio
import serial
import serial.tools.list_ports

from app.core.config import settings
from app.data_sources.base import DataSource


class SerialPortReader(DataSource):
    def __init__(self) -> None:
        self._port: serial.Serial | None = None
        self._open_port()

    def _open_port(self) -> None:
        try:
            self._port = serial.Serial(
                port=settings.serial_port,
                baudrate=115200,
                timeout=1,
            )
        except serial.SerialException:
            self._port = None

    def _ensure_open(self) -> None:
        if self._port is None or not self._port.is_open:
            self._open_port()

    async def read(self) -> str:
        self._ensure_open()
        if self._port is None:
            await asyncio.sleep(1)
            return ""
        try:
            line = self._port.readline().decode("utf-8", errors="ignore").strip()
            if not line:
                await asyncio.sleep(0.1)
                return ""
            return line
        except (serial.SerialException, OSError):
            self._port = None
            await asyncio.sleep(1)
            return ""