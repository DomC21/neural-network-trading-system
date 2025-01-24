"""Verify the generated sample data meets all requirements."""
import json
import pandas as pd

def verify_sample_data():
    # Load and verify the data
    with open('sample_services.json', 'r') as f:
        services = json.load(f)

    # Convert to DataFrame for easy analysis
    df = pd.DataFrame(services)

    # Add calculated fields
    df['avg_monthly_profit'] = df.apply(lambda x: sum(x['performance']['monthly_profits']) / 12, axis=1)

    # Print summary statistics
    print('\nData Verification Summary:')
    print('=========================')
    print(f'Total Services: {len(services)}')
    
    print('\nCategory Distribution:')
    print(df['category'].value_counts())
    
    print('\nProfit Margin Statistics:')
    print(df.groupby('category')['metrics'].apply(
        lambda x: pd.DataFrame(x.tolist())['profit_margin'].describe()
    ))
    
    print('\nRequired Fields Check:')
    required_fields = [
        'name', 'description',  # Service Details
        'costs',               # Financial Data
        'metrics',            # Performance Metrics
        'resources',          # Resource Requirements
        'performance'         # Historical Data
    ]
    
    for field in required_fields:
        present = all(field in service for service in services)
        print(f'{field}: {"✓" if present else "✗"}')
        
    # Verify specific requirements
    print('\nDetailed Requirements Check:')
    print('=========================')
    
    # Check profit margin thresholds
    profitable = df[df['category'] == 'Profitable']['metrics'].apply(
        lambda x: pd.Series(x)['profit_margin'] > 40
    ).all()
    optimization = df[df['category'] == 'Optimization']['metrics'].apply(
        lambda x: 20 <= pd.Series(x)['profit_margin'] <= 40
    ).all()
    unprofitable = df[df['category'] == 'Unprofitable']['metrics'].apply(
        lambda x: pd.Series(x)['profit_margin'] < 20
    ).all()
    
    print(f'Profitable services all >40% margin: {"✓" if profitable else "✗"}')
    print(f'Optimization services all 20-40% margin: {"✓" if optimization else "✗"}')
    print(f'Unprofitable services all <20% margin: {"✓" if unprofitable else "✗"}')
    
    # Check historical data requirements
    has_12_months = all(
        len(service['performance']['monthly_profits']) == 12 
        for service in services
    )
    print(f'12 months of historical data: {"✓" if has_12_months else "✗"}')
    
    has_seasonal = all(
        'seasonal_trends' in service['performance']
        for service in services
    )
    print(f'Seasonal trends data: {"✓" if has_seasonal else "✗"}')

if __name__ == "__main__":
    verify_sample_data()
