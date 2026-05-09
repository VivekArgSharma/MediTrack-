from pydantic import BaseModel


class PatientVitalsRecord(BaseModel):
    id: str
    timestamp: str
    heart_rate: int
    spo2: int
    temperature: float
    steps: int
    fall_detected: bool
    motion: str
    battery: int
