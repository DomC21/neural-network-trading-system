const API_URL = 'http://127.0.0.1:8000';

export async function fetchServices() {
  const response = await fetch(`${API_URL}/api/services`);
  if (!response.ok) {
    throw new Error('Failed to fetch services');
  }
  return response.json();
}

export async function analyzeService(service: any) {
  console.log('API URL:', API_URL);
  console.log('Analyzing service:', service);
  try {
    const response = await fetch(`${API_URL}/api/services/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        costs: {
          fixed_costs: 5000,
          variable_costs: 15000
        },
        metrics: service.metrics,
        resources: {
          equipment_required: ["Equipment A", "Equipment B"],
          contractor_count: 3
        },
        performance: service.performance
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to analyze service: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

export async function createService(service: any) {
  const response = await fetch(`${API_URL}/api/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(service),
  });
  if (!response.ok) {
    throw new Error('Failed to create service');
  }
  return response.json();
}
