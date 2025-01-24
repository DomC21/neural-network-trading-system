"""Verify database records and schema."""
from sqlalchemy import inspect
from models import ServiceDB, engine

def verify_database():
    # Get inspector
    inspector = inspect(engine)
    
    # Check table schema
    columns = inspector.get_columns('services')
    print("\nDatabase Schema Verification:")
    print("============================")
    for column in columns:
        print(f"{column['name']}: {column['type']}")
    
    # Check records
    from sqlalchemy.orm import Session
    session = Session(engine)
    services = session.query(ServiceDB).all()
    
    print(f"\nTotal Records in Database: {len(services)}")
    print("\nCategory Distribution:")
    categories = {}
    for service in services:
        # Calculate profit margin
        total_costs = service.fixed_costs + service.variable_costs
        profit_margin = ((service.revenue - total_costs) / service.revenue) * 100
        
        # Classify based on profit margin
        if profit_margin > 40:
            category = "Profitable"
        elif profit_margin >= 20:
            category = "Optimization"
        else:
            category = "Unprofitable"
            
        categories[category] = categories.get(category, 0) + 1
        
        # Print detailed service info for verification
        print(f"\nService: {service.name}")
        print(f"Revenue: ${service.revenue:,.2f}")
        print(f"Total Costs: ${total_costs:,.2f}")
        print(f"Profit Margin: {profit_margin:.1f}%")
        print(f"Category: {category}")
    
    for category, count in categories.items():
        print(f"{category}: {count}")
    
    # Verify JSON fields
    print("\nJSON Fields Verification:")
    print("======================")
    sample_service = services[0]
    print(f"Resources: {type(sample_service.resources)}")
    print(f"Historical Profitability: {type(sample_service.historical_profitability)}")
    
    session.close()

if __name__ == "__main__":
    verify_database()
