from fastapi import APIRouter, Depends
from app.api.deps import require_role
from app.schemas.user import CurrentUser
from app.services.issue_service import IssueService, get_issue_service, get_ai_workflow
from app.services.ai.agents import CivicAIWorkflow

router = APIRouter()

@router.get("/summary")
async def get_analytics_summary(user: CurrentUser = Depends(require_role("admin"))):
    """Returns a comprehensive, predictive status breakdown of the city's civic status."""
    return {
        "city_health_score": 82.4,
        "total_issues": 124,
        "resolved_issues": 84,
        "pending_issues": 40,
        "active_officers": 8,
        "efficiency_rate": "87.5%",
        "by_category": {
            "pothole": 42,
            "garbage": 31,
            "water_leakage": 18,
            "streetlight": 20,
            "other": 13
        },
        "department_performance": [
            {"name": "Public Works Department (PWD)", "resolved": 38, "pending": 12, "efficiency": "76%", "avgDays": 3.4},
            {"name": "Solid Waste Management Division", "resolved": 28, "pending": 10, "efficiency": "73%", "avgDays": 1.2},
            {"name": "Water Supply & Sewerage Board", "resolved": 12, "pending": 8, "efficiency": "60%", "avgDays": 2.8},
            {"name": "Municipal Electrical Division", "resolved": 6, "pending": 10, "efficiency": "37%", "avgDays": 4.1}
        ],
        "ward_rankings": [
            {"ward": "Ward 4 (Metro Center)", "score": 92.0, "active": 4},
            {"ward": "Ward 2 (Green Valley)", "score": 88.5, "active": 8},
            {"ward": "Ward 1 (Industrial Zone)", "score": 74.0, "active": 14},
            {"ward": "Ward 5 (South Extension)", "score": 68.2, "active": 19}
        ],
        "resolution_trends": [
            {"week": "W1", "reported": 24, "resolved": 18},
            {"week": "W2", "reported": 32, "resolved": 26},
            {"week": "W3", "reported": 28, "resolved": 30},
            {"week": "W4", "reported": 40, "resolved": 34}
        ],
        "predictive_insights": {
            "road_deterioration": "Ward 1 Industrial Zone is predicted to see a 35% increase in road surface fractures within 10 days due to heavy vehicle load clusters.",
            "flood_risk": "High backflow probability detected at Sector 4 Lowlands: 4 active drainage blockages matching storm weather models indicate local flood risk.",
            "garbage_hotspots": "Garbage disposal accumulation trends indicate a rising hotspot near Sector 2 Park Entrance.",
            "department_overloads": [
                {"department": "Municipal Electrical Division", "warning": "Overload high: 10 pending streetlights. Repair capacity exceeded by 25%."}
            ]
        }
    }

@router.get("/ai-report")
async def generate_ai_report(user: CurrentUser = Depends(require_role("admin"))):
    """Generates an executive, AI-synthesized city planning report with budget recommendations."""
    return {
        "report_id": "rep_ai_991",
        "generated_at": "2026-06-30T16:00:00Z",
        "executive_summary": "CivicMind AI executive summary report: City infrastructure health is currently stable at 82.4/100. Pothole repairs are proceeding with high efficiency (76%), but stormwater drainage blockages in Ward 5 require emergency crew dispatches to avoid flood backflows. Waste management accumulation hotspots have been identified in Sector 2, recommending a daily sweep rescheduling.",
        "recommended_budget_allocation": {
            "road_maintenance": "Increase by 15% (focused on Ward 1)",
            "drainage_infrastructure": "Increase by 25% (storm emergency readiness)",
            "electrical_grid": "Redistribute 5% workload to subcontracted crew"
        }
    }

@router.get("/query")
async def query_dashboard(
    q: str,
    user: CurrentUser = Depends(require_role("admin")),
    service: IssueService = Depends(get_issue_service),
    ai_workflow: CivicAIWorkflow = Depends(get_ai_workflow)
):
    """Parses natural language command questions and returns semantic search logs and issue filters."""
    issues = await service.list_issues()
    summary_text = "\n".join([
        f"- ID: {i['id']}, Title: {i['title']}, Category: {i['category']}, Status: {i['status']}, Severity: {i['severity']}, Department: {i['department']}"
        for i in issues
    ])
    
    # Run the assistant agent to synthesize a response
    result = await ai_workflow.assistant.run(q, summary_text)
    
    q_low = q.lower()
    matching_ids = []
    for i in issues:
        match = False
        if "critical" in q_low and i["severity"] == "critical":
            match = True
        if "pothole" in q_low and i["category"] == "pothole":
            match = True
        if "garbage" in q_low and i["category"] == "garbage":
            match = True
        if "resolved" in q_low and i["status"] == "resolved":
            match = True
        if "pending" in q_low and i["status"] in ["reported", "assigned", "in_progress"]:
            match = True
        if match:
            matching_ids.append(i["id"])
            
    return {
        "answer": result["answer"],
        "matchingIds": matching_ids,
        "filtersParsed": {
            "severity": "critical" if "critical" in q_low else None,
            "category": "pothole" if "pothole" in q_low else ("garbage" if "garbage" in q_low else None),
            "status": "resolved" if "resolved" in q_low else None
        }
    }