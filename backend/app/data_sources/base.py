from abc import ABC, abstractmethod


class DataSource(ABC):
    @abstractmethod
    async def read(self) -> str:
        raise NotImplementedError
