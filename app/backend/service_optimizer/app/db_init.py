"""Initialize database with sample service data."""
import json
import os
from sqlalchemy.orm import Session
from models import ServiceDB, init_db, get_db, engine
from datetime import datetime

def load_sample_data():
    """Load sample data from JSON file and populate database."""
    # Drop and recreate all tables
    ServiceDB.metadata.drop_all(engine)
    init_db()
    
    # Create a database session
    db = Session(engine)
    
    try:
        # Get the correct path to sample_services.json
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        sample_data_path = os.path.join(current_dir, 'sample_services.json')
        
        # Load sample data
        with open(sample_data_path, 'r') as f:
            services = json.load(f)
            
        # Clear existing data
        db.query(ServiceDB).delete()
        
        # Insert services into database
        for service in services:
            db_service = ServiceDB(
                name=service['name'],
                description=service['description'],
                revenue=float(service['metrics']['revenue']),
                fixed_costs=float(service['costs']['fixed_costs']),
                variable_costs=float(service['costs']['variable_costs']),
                resources={
                    "equipment_required": service['resources']['equipment_required'],
                    "contractor_count": service['resources']['contractor_count']
                },
                historical_profitability={
                    "monthly_profits": service['performance']['monthly_profits'],
                    "seasonal_trends": service['performance']['seasonal_trends']
                },
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(db_service)
        
        # Commit changes
        db.commit()
        print(f"Successfully loaded {len(services)} services into database")
        
    except Exception as e:
        print(f"Error loading sample data: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    load_sample_data()
