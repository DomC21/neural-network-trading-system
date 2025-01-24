"""Classify service based on profitability and performance metrics."""
import json
import numpy as np
from datetime import datetime

def classify_service(service_name: str):
    # Load service data
    with open('sample_services.json', 'r') as f:
        services = json.load(f)
    
    service = next(s for s in services if s['name'] == service_name)
    
    # Calculate key metrics for classification
    profit_margin = service['metrics']['profit_margin']
    monthly_profits = np.array(service['performance']['monthly_profits'])
    consistently_unprofitable = all(profit < 0 for profit in monthly_profits)
    avg_roi = (service['metrics']['revenue'] - 
               (service['costs']['fixed_costs'] + service['costs']['variable_costs'])) / \
              (service['costs']['fixed_costs'] + service['costs']['variable_costs'])
    
    # Determine classification
    if profit_margin > 40:
        category = "Profitable"
        rationale = [
            f"High profit margin of {profit_margin}%",
            f"Strong revenue of ${service['metrics']['revenue']:,.2f}",
            f"Good usage count of {service['metrics']['usage_count']}",
            f"Positive ROI of {avg_roi*100:.1f}%"
        ]
        recommendations = [
            "Consider scaling operations",
            "Increase marketing investment",
            "Expand contractor team if demand grows"
        ]
    elif profit_margin > 20:
        category = "Optimization Necessary"
        rationale = [
            f"Moderate profit margin of {profit_margin}%",
            f"Revenue of ${service['metrics']['revenue']:,.2f} could be improved",
            f"Current usage count: {service['metrics']['usage_count']}",
            f"ROI of {avg_roi*100:.1f}% needs improvement"
        ]
        recommendations = [
            "Review cost structure",
            "Optimize resource allocation",
            "Consider price adjustments"
        ]
    else:
        category = "Unprofitable"
        rationale = [
            f"Low profit margin of {profit_margin}%",
            f"Insufficient revenue of ${service['metrics']['revenue']:,.2f}",
            f"Low usage count of {service['metrics']['usage_count']}",
            f"Poor ROI of {avg_roi*100:.1f}%"
        ]
        if consistently_unprofitable:
            rationale.append("Consistently unprofitable over 12 months")
        recommendations = [
            "Consider service discontinuation",
            "Major restructuring needed",
            "Evaluate market demand"
        ]
    
    # Print classification report
    print("\nService Classification Report")
    print("===========================")
    print(f"\nService: {service['name']}")
    print(f"Classification: {category}")
    
    print("\nRationale:")
    for reason in rationale:
        print(f"- {reason}")
    
    print("\nRecommendations:")
    for rec in recommendations:
        print(f"- {rec}")
    
    print("\nPerformance Summary:")
    print(f"- Average Monthly Profit: ${np.mean(monthly_profits):,.2f}")
    print(f"- Profit Trend: {'Increasing' if monthly_profits[-1] > monthly_profits[0] else 'Decreasing'}")
    print(f"- ROI: {avg_roi*100:.1f}%")
    
    return {
        "name": service['name'],
        "category": category,
        "rationale": rationale,
        "recommendations": recommendations,
        "performance_summary": {
            "avg_monthly_profit": float(np.mean(monthly_profits)),
            "profit_trend": "Increasing" if monthly_profits[-1] > monthly_profits[0] else "Decreasing",
            "roi": float(avg_roi)
        }
    }

if __name__ == "__main__":
    classify_service("Email Support")
