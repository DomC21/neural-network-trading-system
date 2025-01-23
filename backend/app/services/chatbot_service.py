from typing import Dict

class ChatbotService:
    def __init__(self):
        self.responses: Dict[str, str] = {
            "job_status": "To check your job status, please provide your job ID.",
            "contractor": "Our contractors are certified professionals with relevant experience.",
            "timeframe": "Typical job completion time varies based on complexity. Simple jobs may take 1-2 days, while complex ones could take a week.",
            "help": "I can help you with: checking job status, learning about our contractors, or understanding timeframes. What would you like to know?",
        }
    
    def get_response(self, query: str) -> str:
        # Simple keyword matching for demo purposes
        query = query.lower()
        
        if "status" in query:
            return self.responses["job_status"]
        elif "contractor" in query:
            return self.responses["contractor"]
        elif "time" in query or "long" in query:
            return self.responses["timeframe"]
        else:
            return self.responses["help"]
