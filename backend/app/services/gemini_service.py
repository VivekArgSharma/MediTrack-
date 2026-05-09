from datetime import datetime, timezone
from typing import Any

from app.core.config import settings


def _build_prompt(batch: dict[str, Any]) -> str:
    hr_vals = batch.get("hr_data", {}).get("values", [])
    spo2_vals = batch.get("spo2_data", {}).get("values", [])
    temp_vals = batch.get("temp_data", {}).get("values", [])
    fall_vals = batch.get("fall_data", {}).get("values", [])
    motion_vals = batch.get("motion_data", {}).get("values", [])

    def avg(vals):
        return round(sum(vals) / len(vals), 1) if vals else 0

    def mx(vals):
        return max(vals) if vals else 0

    def mn(vals):
        return min(vals) if vals else 0

    prompt = f"""You are a medical AI assistant generating a patient health report.
Analyze the following vital signs recorded over the last 20 seconds and produce a JSON response.

Data:
- Heart Rate (bpm): values={hr_vals}, avg={avg(hr_vals)}, min={mn(hr_vals)}, max={mx(hr_vals)}
- SpO2 (%): values={spo2_vals}, avg={avg(spo2_vals)}, min={mn(spo2_vals)}, max={mx(spo2_vals)}
- Temperature (°C): values={temp_vals}, avg={avg(temp_vals)}, min={mn(temp_vals)}, max={mx(temp_vals)}
- Fall events: {sum(fall_vals) if fall_vals else 0} detected
- Motion states: {motion_vals}

Respond ONLY with valid JSON (no markdown, no explanation):
{{
  "text_summary": "2-3 sentence paragraph summarizing patient condition",
  "health_score": integer 0-100,
  "risk_level": "Low" or "Moderate" or "High",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "metrics_summary": {{
    "hr": {{"avg": number, "min": number, "max": number}},
    "spo2": {{"avg": number, "min": number, "max": number}},
    "temp": {{"avg": number, "min": number, "max": number}},
    "fall_count": number,
    "motion_distribution": {{"Walking": number, "Idle": number, "Emergency": number, "other": number}}
  }}
}}"""
    return prompt


async def generate_report_with_gemini(batch: dict[str, Any]) -> dict[str, Any]:
    if not settings.gemini_api_key:
        return _fallback_report(batch)

    import google.generativeai as genai
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = _build_prompt(batch)
    try:
        response = await model.generate_content_async(prompt)
        import json
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw[raw.index("{"): raw.rindex("}") + 1]
        data = json.loads(raw)
        data["generated_at"] = datetime.now(timezone.utc).isoformat()
        return data
    except Exception:
        return _fallback_report(batch)


def _fallback_report(batch: dict[str, Any]) -> dict[str, Any]:
    hr_vals = batch.get("hr_data", {}).get("values", [])
    spo2_vals = batch.get("spo2_data", {}).get("values", [])
    temp_vals = batch.get("temp_data", {}).get("values", [])
    fall_vals = batch.get("fall_data", {}).get("values", [])
    motion_vals = batch.get("motion_data", {}).get("values", [])

    def avg(vals):
        return round(sum(vals) / len(vals), 1) if vals else 0

    hr_avg = avg(hr_vals)
    spo2_avg = avg(spo2_vals)
    temp_avg = avg(temp_vals)
    fall_count = sum(fall_vals) if fall_vals else 0

    risk = "Low"
    if fall_count > 0 or spo2_avg < 94 or temp_avg > 37.5:
        risk = "High"
    elif spo2_avg < 97 or temp_avg > 37.0:
        risk = "Moderate"

    score = 100 - (fall_count * 20) - max(0, int(hr_avg - 80)) // 2
    score = max(0, min(100, score))

    motion_counts: dict[str, int] = {}
    for m in motion_vals:
        motion_counts[m] = motion_counts.get(m, 0) + 1

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "text_summary": (
            f"Patient monitored for 20 seconds. Average heart rate {hr_avg} bpm, "
            f"SpO2 {spo2_avg}%, temperature {temp_avg}°C. "
            f"{'No fall events detected.' if fall_count == 0 else f'{fall_count} fall event(s) detected.'}"
        ),
        "health_score": score,
        "risk_level": risk,
        "recommendations": [
            "Continue monitoring if vitals are within normal range.",
            "Review any fall events with caregiver.",
            "Consult physician if SpO2 drops below 94% or HR exceeds 110 bpm.",
        ],
        "metrics_summary": {
            "hr": {"avg": hr_avg, "min": min(hr_vals) if hr_vals else 0, "max": max(hr_vals) if hr_vals else 0},
            "spo2": {"avg": spo2_avg, "min": min(spo2_vals) if spo2_vals else 0, "max": max(spo2_vals) if spo2_vals else 0},
            "temp": {"avg": temp_avg, "min": min(temp_vals) if temp_vals else 0, "max": max(temp_vals) if temp_vals else 0},
            "fall_count": fall_count,
            "motion_distribution": motion_counts,
        },
    }