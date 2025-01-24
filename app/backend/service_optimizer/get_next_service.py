"""Get the next unprocessed service from the todo list."""
import json

def get_next_service():
    # Load sample data
    with open('sample_services.json', 'r') as f:
        services = json.load(f)
    
    # Get first service matching Email Support
    service = next(s for s in services if s['name'] == 'Email Support')
    
    print('\nNext Service for Analysis:')
    print('=========================')
    print(json.dumps(service, indent=2))

if __name__ == "__main__":
    get_next_service()
