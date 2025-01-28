import { Service } from './types';

const API_URL = 'http://172.16.1.2:8000/api';

export async function fetchServices() {
  try {
    const url = `${API_URL}/services`;
    console.log('Fetching services from:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }
    const data = await response.json();
    console.log('Fetched services:', data);
    return data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
}

export async function analyzeService(service: Service) {
  try {
    const response = await fetch(`${API_URL}/services/analyze`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify(service),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to analyze service: ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to analyze service:', error);
    throw error;
  }
}

export async function createService(service: Service) {
  const response = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    body: JSON.stringify(service),
  });
  if (!response.ok) {
    throw new Error('Failed to create service');
  }
  return response.json();
}

interface ThresholdUpdate {
  profitableMin: number;
  optimizationMin: number;
  unprofitableMax: number;
}

export async function updateThresholds(thresholds: ThresholdUpdate): Promise<void> {
  const response = await fetch(`${API_URL}/thresholds`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    body: JSON.stringify(thresholds),
  });
  if (!response.ok) {
    throw new Error('Failed to update thresholds');
  }
}
