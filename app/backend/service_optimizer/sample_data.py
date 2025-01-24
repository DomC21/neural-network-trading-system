"""Generate sample service data for the demo phase."""
import random
from datetime import datetime, timedelta
import json

def generate_monthly_profits(base_profit: float, volatility: float = 0.2) -> list:
    """Generate 12 months of profit data with seasonal variations."""
    return [
        base_profit * (1 + random.uniform(-volatility, volatility))
        for _ in range(12)
    ]

def generate_seasonal_trends() -> dict:
    """Generate seasonal performance patterns."""
    seasons = ['winter', 'spring', 'summer', 'fall']
    return {
        season: random.uniform(0.8, 1.2)
        for season in seasons
    }

# Sample services for each category
profitable_services = [
    {
        "id": "prof-001",
        "name": "Fine Art Packaging",
        "description": "Industry-specific packing materials and methods for securing precious works of art",
        "category": "Profitable",
        "costs": {
            "fixed_costs": 5000,
            "variable_costs": 15000
        },
        "metrics": {
            "revenue": 50000,
            "usage_count": 25,
            "profit_margin": 45.5
        },
        "resources": {
            "equipment_required": ["Custom Crating Materials", "Art Handling Equipment"],
            "contractor_count": 3
        },
        "performance": {
            "monthly_profits": generate_monthly_profits(30000),
            "seasonal_trends": generate_seasonal_trends()
        }
    },
    {
        "id": "prof-002",
        "name": "Precision Packaging & Crating",
        "description": "Expert crating and packaging for high-value items and delicate equipment",
        "category": "Profitable",
        "costs": {
            "fixed_costs": 8000,
            "variable_costs": 25000
        },
        "metrics": {
            "revenue": 75000,
            "usage_count": 15,
            "profit_margin": 42.0
        },
        "resources": {
            "equipment_required": ["Industrial Crating Tools", "Custom Packaging Materials"],
            "contractor_count": 5
        },
        "performance": {
            "monthly_profits": generate_monthly_profits(42000),
            "seasonal_trends": generate_seasonal_trends()
        }
    },
    {
        "id": "prof-003",
        "name": "Pure Install",
        "description": "Professional installation services for complex equipment and systems",
        "category": "Profitable",
        "costs": {
            "fixed_costs": 6000,
            "variable_costs": 18000
        },
        "metrics": {
            "revenue": 55000,
            "usage_count": 30,
            "profit_margin": 41.2
        },
        "resources": {
            "equipment_required": ["Installation Tools", "Testing Equipment"],
            "contractor_count": 4
        },
        "performance": {
            "monthly_profits": generate_monthly_profits(31000),
            "seasonal_trends": generate_seasonal_trends()
        }
    }
]

optimization_services = [
    {
        "id": "opt-001",
        "name": "Chandelier Services",
        "description": "Expert removal, crating, and reinstallation of chandeliers and light fixtures",
        "category": "Optimization",
        "costs": {
            "fixed_costs": 4000,
            "variable_costs": 16000
        },
        "metrics": {
            "revenue": 30000,
            "usage_count": 20,
            "profit_margin": 35.0
        },
        "resources": {
            "equipment_required": ["Specialized Tools", "Custom Crating Materials"],
            "contractor_count": 3
        },
        "performance": {
            "monthly_profits": generate_monthly_profits(15000),
            "seasonal_trends": generate_seasonal_trends()
        }
    },
    {
        "id": "opt-002",
        "name": "Exercise Equipment Services",
        "description": "Professional disassembly and reassembly of home and commercial exercise equipment",
        "category": "Optimization",
        "costs": {
            "fixed_costs": 8000,
            "variable_costs": 13000
        },
        "metrics": {
            "revenue": 35000,
            "usage_count": 15,
            "profit_margin": 35.0
        },
        "resources": {
            "equipment_required": ["Specialized Tools", "Equipment Manuals"],
            "contractor_count": 2
        },
        "performance": {
            "monthly_profits": generate_monthly_profits(10000),
            "seasonal_trends": generate_seasonal_trends()
        }
    },
    {
        "id": "opt-003",
        "name": "Gaming Table Services",
        "description": "Expert handling of pool tables, air hockey, and other gaming equipment",
        "category": "Optimization",
        "costs": {
            "fixed_costs": 8000,
            "variable_costs": 15000
        },
        "metrics": {
            "revenue": 35000,
            "usage_count": 10,
            "profit_margin": 35.5
        },
        "resources": {
            "equipment_required": ["Table Service Tools", "Leveling Equipment"],
            "contractor_count": 4
        },
        "performance": {
            "monthly_profits": generate_monthly_profits(20000),
            "seasonal_trends": generate_seasonal_trends()
        }
    }
]

unprofitable_services = [
    {
        "id": "unp-001",
        "name": "Outdoor Play Equipment",
        "description": "Disassembly and reassembly of forts, swing sets, and trampolines",
        "category": "Unprofitable",
        "costs": {
            "fixed_costs": 6000,
            "variable_costs": 14000
        },
        "metrics": {
            "revenue": 22000,
            "usage_count": 8,
            "profit_margin": 10.2
        },
        "resources": {
            "equipment_required": ["Assembly Tools", "Safety Equipment"],
            "contractor_count": 2
        },
        "performance": {
            "monthly_profits": generate_monthly_profits(2000),
            "seasonal_trends": generate_seasonal_trends()
        }
    },
    {
        "id": "unp-002",
        "name": "Basic Appliance Service",
        "description": "Basic appliance disconnection and reconnection",
        "category": "Unprofitable",
        "costs": {
            "fixed_costs": 2000,
            "variable_costs": 8000
        },
        "metrics": {
            "revenue": 12000,
            "usage_count": 50,
            "profit_margin": 15.4
        },
        "resources": {
            "equipment_required": ["Basic Tools", "Safety Equipment"],
            "contractor_count": 1
        },
        "performance": {
            "monthly_profits": generate_monthly_profits(2000),
            "seasonal_trends": generate_seasonal_trends()
        }
    },
    {
        "id": "unp-003",
        "name": "Clock Services",
        "description": "Basic clock removal and reinstallation services",
        "category": "Unprofitable",
        "costs": {
            "fixed_costs": 3000,
            "variable_costs": 10000
        },
        "metrics": {
            "revenue": 15000,
            "usage_count": 100,
            "profit_margin": 13.3
        },
        "resources": {
            "equipment_required": ["Clock Tools", "Packing Materials"],
            "contractor_count": 3
        },
        "performance": {
            "monthly_profits": generate_monthly_profits(2000),
            "seasonal_trends": generate_seasonal_trends()
        }
    }
]

# Combine all services
all_services = profitable_services + optimization_services + unprofitable_services

if __name__ == "__main__":
    # Save to JSON file
    with open('sample_services.json', 'w') as f:
        json.dump(all_services, f, indent=2)
    print(f"Generated {len(all_services)} sample services")
