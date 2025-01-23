# MSS AI Operational Efficiency Demo

This repository contains a demonstration of job assignment and customer communication modules for an MSS AI Operational Efficiency Software system.

## Project Structure
- `frontend/`: React-based web interface with Tailwind CSS and shadcn/ui
  - Job request submission form
  - Active jobs dashboard
  - Customer notification system
- `backend/`: FastAPI backend service
  - Job request processing
  - Contractor assignment logic
  - Automated customer communications
  - Simple chatbot interface

## Setup Instructions

### Backend Setup
```bash
cd backend
poetry install
poetry run fastapi dev app/main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173 and the backend API at http://localhost:8000.

## Features
- Job Request Management
- Contractor Assignment System
- Customer Communication Automation
- Real-time Status Updates
