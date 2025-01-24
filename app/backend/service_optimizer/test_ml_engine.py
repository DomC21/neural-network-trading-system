from app.ml_engine import ServiceOptimizationEngine
import json

def test_classification():
    # Load sample data
    with open('sample_services.json', 'r') as f:
        services = json.load(f)
    
    engine = ServiceOptimizationEngine()
    
    print("\nService Classification and Analysis")
    print("=================================")
    
    category_counts = {"Profitable": 0, "Optimization": 0, "Unprofitable": 0}
    scaling_candidates = []
    discontinuation_candidates = []
    
    for service in services:
        category, confidence, should_discontinue, should_scale = engine.classify_service(service)
        suggestions = engine.generate_optimization_suggestions(service)
        
        # Update category counts
        category_counts[category] += 1
        
        # Track scaling and discontinuation candidates
        if should_scale:
            scaling_candidates.append(service['name'])
        if should_discontinue:
            discontinuation_candidates.append(service['name'])
        
        print(f"\nService: {service['name']}")
        print(f"Category: {category}")
        print(f"Confidence: {confidence:.2f}")
        print(f"Profit Margin: {engine.calculate_profit_margin(service):.1f}%")
        
        if should_scale:
            print("✓ Recommended for Scaling:")
            print(f"  Reason: {engine.check_scaling_criteria(service)[1]}")
        if should_discontinue:
            print("⚠ Recommended for Discontinuation:")
            print(f"  Reason: {engine.check_discontinuation_criteria(service)[1]}")
        
        if suggestions:
            print("Optimization Suggestions:")
            for suggestion in suggestions:
                print(f"- {suggestion}")
        print("-" * 50)
    
    # Print summary
    print("\nCategory Distribution:")
    for category, count in category_counts.items():
        print(f"{category}: {count}")
    
    if scaling_candidates:
        print("\nServices Recommended for Scaling:")
        for service in scaling_candidates:
            print(f"- {service}")
    
    if discontinuation_candidates:
        print("\nServices Recommended for Discontinuation:")
        for service in discontinuation_candidates:
            print(f"- {service}")


if __name__ == "__main__":
    test_classification()
