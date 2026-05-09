import asyncio
import random

from app.data_sources.base import DataSource


class FakeDataGenerator(DataSource):
    def __init__(self) -> None:
        self.heart_rate = 78
        self.spo2 = 98
        self.temperature = 36.8
        self.steps = 1200
        self.battery = 96
        self.fall_cooldown = 0
        self.motion_states = ["Resting", "Walking", "Recovery", "Therapy"]

    async def read(self) -> str:
        await asyncio.sleep(0)
        self.heart_rate = max(58, min(128, self.heart_rate + random.randint(-4, 5)))
        self.spo2 = max(88, min(100, self.spo2 + random.randint(-1, 1)))
        self.temperature = max(35.9, min(38.6, round(self.temperature + random.uniform(-0.15, 0.18), 1)))
        self.steps += random.randint(0, 22)
        self.battery = max(18, self.battery - random.choice([0, 0, 0, 1]))

        if self.fall_cooldown > 0:
            self.fall_cooldown -= 1
            fall = 0
        else:
            fall = 1 if random.random() < 0.05 else 0
            if fall:
                self.fall_cooldown = 12

        motion = "Emergency" if fall else random.choice(self.motion_states)
        return (
            f"HR:{self.heart_rate},SpO2:{self.spo2},Temp:{self.temperature},"
            f"Steps:{self.steps},Fall:{fall},Motion:{motion},Battery:{self.battery}"
        )
