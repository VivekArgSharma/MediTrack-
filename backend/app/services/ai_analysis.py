from collections.abc import Sequence
from datetime import datetime, timezone

from app.schemas.health import Insight, VitalEnvelope


def generate_insight(history: Sequence[VitalEnvelope]) -> Insight:
    if not history:
        return Insight(
            generated_at=datetime.now(timezone.utc),
            summary="Waiting for enough streaming data to build an AI summary.",
            recommendations=["Keep the simulator running to accumulate a live baseline."],
            anomaly_detected=False,
            confidence=0.45,
        )

    recent = list(history)[-12:]
    avg_hr = sum(item.data.heart_rate for item in recent) / len(recent)
    avg_spo2 = sum(item.data.spo2 for item in recent) / len(recent)
    avg_temp = sum(item.data.temperature for item in recent) / len(recent)
    falls = sum(item.data.fall_detected for item in recent)
    has_critical = any(item.status == "Critical" for item in recent)

    summary = (
        f"Recent telemetry shows an average heart rate of {avg_hr:.0f} bpm, "
        f"SpO2 of {avg_spo2:.0f}%, and temperature of {avg_temp:.1f} C."
    )
    if has_critical:
        summary += " Critical events were observed in the recent monitoring window."
    elif avg_hr > 95 or avg_temp > 37.7:
        summary += " The patient is stable but trending toward elevated exertion."
    else:
        summary += " Vital trends remain within a generally steady range."

    recommendations = [
        "Continue observing the next minute of live readings for trend confirmation.",
        "Review the alert timeline for recurring threshold crossings.",
    ]
    if avg_spo2 <= 92:
        recommendations.insert(0, "Validate oxygen saturation sensor placement and confirm respiratory status.")
    if falls:
        recommendations.insert(0, "Escalate fall protocol and verify patient mobility support.")

    return Insight(
        generated_at=datetime.now(timezone.utc),
        summary=summary,
        recommendations=recommendations,
        anomaly_detected=has_critical or avg_spo2 <= 92,
        confidence=0.87 if recent else 0.45,
    )
