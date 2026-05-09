from app.data_sources.base import DataSource


class SerialPortReader(DataSource):
    def __init__(self, *_args, **_kwargs) -> None:
        raise NotImplementedError("Serial port integration is reserved for the ESP32 phase.")

    async def read(self) -> str:
        raise NotImplementedError
