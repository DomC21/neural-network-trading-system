from app.ml_engine import ServiceOptimizationEngine
import json
import pandas as pd
import matplotlib.pyplot as plt

def test_forecasting():
    # Load sample data
    with open('sample_services.json', 'r') as f:
        services = json.load(f)
    
    engine = ServiceOptimizationEngine()
    
    print("\nTesting Profitability Forecasting")
    print("===============================")
    
    for service in services[:3]:  # Test first 3 services
        print(f"\nService: {service['name']}")
        forecast = engine.forecast_profitability(service)
        
        print("Forecasted Profits (Next 12 Months):")
        for date, profit, lower, upper in zip(
            forecast['dates'],
            forecast['predicted_profits'],
            forecast['lower_bound'],
            forecast['upper_bound']
        ):
            print(f"{date}: ${profit:,.2f} (Range: ${lower:,.2f} to ${upper:,.2f})")
        
        # Plot forecasts
        plt.figure(figsize=(12, 6))
        plt.plot(range(12), service['performance']['monthly_profits'], 'b-', label='Historical')
        plt.plot(range(12, 24), forecast['predicted_profits'], 'r--', label='Forecast')
        plt.fill_between(
            range(12, 24),
            forecast['lower_bound'],
            forecast['upper_bound'],
            color='r',
            alpha=0.1
        )
        plt.title(f"Profitability Forecast - {service['name']}")
        plt.xlabel("Month")
        plt.ylabel("Profit ($)")
        plt.legend()
        plt.grid(True)
        plt.savefig(f"forecast_{service['name'].lower().replace(' ', '_')}.png")
        plt.close()
        
        print("\nSeasonal Pattern Analysis:")
        seasonal_data = forecast['seasonal_pattern']['yearly']
        if len(seasonal_data) > 0:
            print("Yearly seasonality detected")
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            seasonal_effects = list(zip(months, seasonal_data))
            
            # Sort months by seasonality effect
            peak_months = [month for month, effect in seasonal_effects if effect > 0]
            trough_months = [month for month, effect in seasonal_effects if effect < 0]
            
            print("\nPeak Months (Positive Seasonality):")
            if peak_months:
                print(", ".join(peak_months))
            else:
                print("None")
                
            print("\nTrough Months (Negative Seasonality):")
            if trough_months:
                print(", ".join(trough_months))
            else:
                print("None")
            
            # Print strongest effects
            max_effect = max(seasonal_data)
            min_effect = min(seasonal_data)
            max_month = months[seasonal_data.index(max_effect)]
            min_month = months[seasonal_data.index(min_effect)]
            
            print(f"\nStrongest positive effect: {max_month} (+{max_effect:.1f}%)")
            print(f"Strongest negative effect: {min_month} ({min_effect:.1f}%)")
        
        print("-" * 50)

if __name__ == "__main__":
    test_forecasting()
