import json
import google.generativeai as genai
from app.core.config import settings
from app.core.exceptions import AIServiceError
from app.schemas.issue import AIAnalysis, IssueCategory, Severity

class GeminiService:
    def __init__(self):
        if settings.gemini_api_key and settings.gemini_api_key != "your_gemini_api_key":
            genai.configure(api_key=settings.gemini_api_key)
        self.model_name = settings.gemini_model

    async def analyze_issue(self, title: str, description: str, image_urls: list[str]) -> AIAnalysis:
        if not settings.gemini_api_key or settings.gemini_api_key == "your_gemini_api_key":
            # High-fidelity mock analysis matching issue contents
            content = (title + " " + description).lower()
            
            # Category prediction
            category: IssueCategory = "pothole"
            if "garbage" in content or "trash" in content or "dump" in content:
                category = "garbage"
            elif "water" in content or "leak" in content or "burst" in content:
                category = "water_leakage"
            elif "light" in content or "bulb" in content or "dark" in content:
                category = "streetlight"
            elif "flood" in content or "rain" in content:
                category = "flooding"
            elif "tree" in content or "branch" in content:
                category = "tree_fallen"

            # Severity prediction
            severity: Severity = "medium"
            priority = 50.0
            repair_days = 5
            
            if any(k in content for k in ["danger", "hazard", "critical", "accident", "blocked"]):
                severity = "critical"
                priority = 90.0
                repair_days = 1
            elif any(k in content for k in ["bad", "severe", "major", "stuck"]):
                severity = "high"
                priority = 75.0
                repair_days = 2
            elif any(k in content for k in ["minor", "small", "annoyance"]):
                severity = "low"
                priority = 25.0
                repair_days = 10

            return AIAnalysis(
                category=category,
                categoryConfidence=0.92,
                severity=severity,
                severityScore=priority / 100.0,
                priorityScore=priority,
                isDuplicate=False,
                tags=[category, severity, "triage-automatic"],
                summary=f"Automatically classified as {category} with {severity} severity based on description analysis.",
                recommendedAction=f"Dispatch {category} response team to inspect and repair structural damage.",
                estimatedRepairDays=repair_days
            )

        try:
            model = genai.GenerativeModel(self.model_name)
            prompt = f"""
            Analyze the following civic issue report:
            Title: {title}
            Description: {description}
            Images: {image_urls}

            Categorize into one of these: pothole, garbage, water_leakage, streetlight, road_crack, drainage, traffic_signal, illegal_dumping, tree_fallen, flooding, public_infrastructure.
            Determine Severity: low, medium, high, critical.
            Assign Priority Score (0.0 to 100.0).
            Estimate Repair Days (integer).
            Identify tags and suggest a recommended action.
            
            Format response as JSON only, conforming to this schema:
            {{
                "category": "<category>",
                "categoryConfidence": <float>,
                "severity": "<severity>",
                "severityScore": <float 0.0-1.0>,
                "priorityScore": <float 0.0-100.0>,
                "isDuplicate": <bool>,
                "tags": ["<tag>", ...],
                "summary": "<short description summary>",
                "recommendedAction": "<suggested action for department>",
                "estimatedRepairDays": <integer>
            }}
            """
            response = model.generate_content(prompt)
            data = json.loads(response.text.strip())
            return AIAnalysis(**data)
        except Exception as exc:
            raise AIServiceError(f"Gemini generation failed: {str(exc)}") from exc

def get_gemini_service() -> GeminiService:
    return GeminiService()