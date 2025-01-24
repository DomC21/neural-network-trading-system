const API_URL = import.meta.env.VITE_API_URL;

export async function fetchServices() {
  const response = await fetch(`${API_URL}/api/services`);
  if (!response.ok) {
    throw new Error('Failed to fetch services');
  }
  return response.json();
}

export async function analyzeService(service: any) {
  const response = await fetch(`${API_URL}/api/services/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(service),
  });
  if (!response.ok) {
    throw new Error('Failed to analyze service');
  }
  return response.json();
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
