"""Analyze service performance, usage, and market position."""
import json
import numpy as np
import pandas as pd
from datetime import datetime

def analyze_service(service_name: str):
    # Load service data
    with open('sample_services.json', 'r') as f:
        services = json.load(f)
    
    service = next(s for s in services if s['name'] == service_name)
    
    # Calculate key metrics
    monthly_profits = np.array(service['performance']['monthly_profits'])
    seasonal_trends = service['performance']['seasonal_trends']
    
    analysis = {
        "service_name": service['name'],
        "category": service['category'],
        
        # Usage Level Analysis
        "usage_metrics": {
            "total_usage": service['metrics']['usage_count'],
            "usage_per_contractor": service['metrics']['usage_count'] / service['resources']['contractor_count']
        },
        
        # Resource Analysis
        "resource_utilization": {
            "equipment": service['resources']['equipment_required'],
            "contractor_count": service['resources']['contractor_count'],
            "revenue_per_contractor": service['metrics']['revenue'] / service['resources']['contractor_count']
        },
        
        # Financial Analysis
        "financial_metrics": {
            "revenue": service['metrics']['revenue'],
            "total_costs": service['costs']['fixed_costs'] + service['costs']['variable_costs'],
            "profit_margin": service['metrics']['profit_margin'],
            "cost_breakdown": {
                "fixed_costs": service['costs']['fixed_costs'],
                "variable_costs": service['costs']['variable_costs'],
                "fixed_cost_ratio": service['costs']['fixed_costs'] / 
                    (service['costs']['fixed_costs'] + service['costs']['variable_costs'])
            }
        },
        
        # Performance Analysis
        "performance_metrics": {
            "avg_monthly_profit": np.mean(monthly_profits),
            "profit_volatility": np.std(monthly_profits),
            "profit_trend": "Increasing" if monthly_profits[-1] > monthly_profits[0] else "Decreasing",
            "best_performing_month": np.argmax(monthly_profits) + 1,
            "worst_performing_month": np.argmin(monthly_profits) + 1
        },
        
        # Seasonal Analysis
        "seasonal_performance": {
            "strongest_season": max(seasonal_trends.items(), key=lambda x: x[1])[0],
            "weakest_season": min(seasonal_trends.items(), key=lambda x: x[1])[0],
            "seasonal_variation": max(seasonal_trends.values()) - min(seasonal_trends.values())
        },
        
        # Market Position
        "market_insights": {
            "service_type": "High-end consulting" if service['metrics']['profit_margin'] > 40 else 
                           "Standard service" if service['metrics']['profit_margin'] > 20 else 
                           "Basic service",
            "price_position": "Premium" if service['metrics']['revenue'] / service['metrics']['usage_count'] > 1500 else
                            "Standard" if service['metrics']['revenue'] / service['metrics']['usage_count'] > 500 else
                            "Economy",
            "scaling_potential": "High" if service['metrics']['profit_margin'] > 40 and 
                                        service['metrics']['usage_count'] > 20 else "Medium"
        }
    }
    
    # Print analysis report
    print("\nService Analysis Report")
    print("=====================")
    print(f"\nService: {analysis['service_name']} ({analysis['category']})")
    
    print("\n1. Usage Level Analysis")
    print(f"Total Usage: {analysis['usage_metrics']['total_usage']}")
    print(f"Usage per Contractor: {analysis['usage_metrics']['usage_per_contractor']:.2f}")
    
    print("\n2. Resource Utilization")
    print(f"Equipment: {', '.join(analysis['resource_utilization']['equipment'])}")
    print(f"Contractors: {analysis['resource_utilization']['contractor_count']}")
    print(f"Revenue per Contractor: ${analysis['resource_utilization']['revenue_per_contractor']:,.2f}")
    
    print("\n3. Financial Analysis")
    print(f"Revenue: ${analysis['financial_metrics']['revenue']:,.2f}")
    print(f"Total Costs: ${analysis['financial_metrics']['total_costs']:,.2f}")
    print(f"Profit Margin: {analysis['financial_metrics']['profit_margin']}%")
    print(f"Fixed Cost Ratio: {analysis['financial_metrics']['cost_breakdown']['fixed_cost_ratio']*100:.1f}%")
    
    print("\n4. Performance Metrics")
    print(f"Average Monthly Profit: ${analysis['performance_metrics']['avg_monthly_profit']:,.2f}")
    print(f"Profit Volatility: ${analysis['performance_metrics']['profit_volatility']:,.2f}")
    print(f"Profit Trend: {analysis['performance_metrics']['profit_trend']}")
    print(f"Best Month: {analysis['performance_metrics']['best_performing_month']}")
    print(f"Worst Month: {analysis['performance_metrics']['worst_performing_month']}")
    
    print("\n5. Seasonal Performance")
    print(f"Strongest Season: {analysis['seasonal_performance']['strongest_season']}")
    print(f"Weakest Season: {analysis['seasonal_performance']['weakest_season']}")
    print(f"Seasonal Variation: {analysis['seasonal_performance']['seasonal_variation']*100:.1f}%")
    
    print("\n6. Market Position")
    print(f"Service Type: {analysis['market_insights']['service_type']}")
    print(f"Price Position: {analysis['market_insights']['price_position']}")
    print(f"Scaling Potential: {analysis['market_insights']['scaling_potential']}")
    
    return analysis

if __name__ == "__main__":
    analyze_service("Email Support")
