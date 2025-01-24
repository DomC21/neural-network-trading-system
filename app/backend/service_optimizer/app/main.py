from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import json
from datetime import datetime
from sqlalchemy.orm import Session

from .models import Service, ServiceClassification, ServiceDB, get_db, init_db
from .ml_engine import ServiceOptimizationEngine

app = FastAPI(title="Service Optimization API")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize ML engine
ml_engine = ServiceOptimizationEngine()

@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/services/analyze")
async def analyze_service(service: Service) -> ServiceClassification:
    """Analyze a service and return classification results"""
    category, confidence, should_discontinue, should_scale = ml_engine.classify_service(service.dict())
    suggestions = ml_engine.generate_optimization_suggestions(service.dict())
    
    # Get detailed reasons for recommendations
    _, discontinue_reason = ml_engine.check_discontinuation_criteria(service.dict())
    _, scale_reason = ml_engine.check_scaling_criteria(service.dict())
    
    # Add recommendations to suggestions if applicable
    if should_discontinue:
        suggestions.insert(0, f"⚠ Consider discontinuation: {discontinue_reason}")
    if should_scale:
        suggestions.insert(0, f"✓ Recommended for scaling: {scale_reason}")
    
    # Enhanced market insights
    market_insights = {
        "market_position": "Premium" if category == "Profitable" else 
                         "Standard" if category == "Optimization" else "Basic",
        "scaling_recommended": should_scale,
        "discontinuation_recommended": should_discontinue,
        "revenue_per_use": service.metrics.revenue / service.metrics.usage_count,
        "profit_trend": "Growing" if service.performance.monthly_profits[-1] > service.performance.monthly_profits[0]
                       else "Declining"
    }
    
    return ServiceClassification(
        service_id=service.id,
        category=category,
        confidence_score=confidence,
        optimization_suggestions=suggestions,
        market_insights=market_insights
    )

@app.get("/api/services")
async def get_services(db: Session = Depends(get_db)) -> List[Service]:
    """Get all services"""
    services = db.query(ServiceDB).all()
    return services

@app.post("/api/services")
async def create_service(service: Service, db: Session = Depends(get_db)) -> Service:
    """Create a new service"""
    db_service = ServiceDB(
        name=service.name,
        description=service.description,
        revenue=service.metrics.revenue,
        fixed_costs=service.costs.fixed_costs,
        variable_costs=service.costs.variable_costs,
        resources={
            "equipment_required": service.resources.equipment_required,
            "contractor_count": service.resources.contractor_count
        },
        historical_profitability={
            "monthly_profits": service.performance.monthly_profits,
            "seasonal_trends": service.performance.seasonal_trends
        }
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service
