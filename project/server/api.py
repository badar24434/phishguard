from fastapi import FastAPI, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import validators
from datetime import datetime
from feature_extraction import PredictURL
import numpy as np

class URLRequest(BaseModel):
    url: str

app = FastAPI(
    title="PhishGuard API",
    description="AI-driven phishing detection API",
    version="1.0.0"
)

# Remove global classifier instance
# classifier = PredictURL()  # <-- Remove this

app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://*", "http://localhost:*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "endpoints": {
            "scan": "/api?url=<url>",
            "docs": "/docs"
        }
    }

def is_valid_url(url: str) -> bool:
    try:
        # Only allow http and https schemes
        if not url.startswith(('http://', 'https://')):
            return False
        return validators.url(url) is True
    except:
        return False

# Add GET method handler
# In api.py
@app.get("/api")
async def predict_get(url: str = Query(...)):
    if not url.startswith(('http://', 'https://')):
        return {"error": "Invalid URL. Only HTTP(S) URLs are supported."}
    
    try:
        print(f"Processing URL: {url}")
        predictor = PredictURL()  # Instantiate here
        result = predictor.predict(url)
        print(f"Prediction result: {result}")
        return {
            "url": url,
            "timestamp": datetime.now().isoformat(),
            **result
        }
    except Exception as e:
        print(f"Error processing URL {url}: {type(e).__name__} - {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": f"Error analyzing URL: {str(e)}"}

@app.post("/api")
async def predict(request: URLRequest):
    url = request.url
    if not validators.url(url):
        return {"error": "Invalid URL"}
    
    if not url.startswith(('http://', 'https://')):
        return {"error": "Invalid URL. Only HTTP(S) URLs are supported."}
    
    try:
        print(f"Processing URL: {url}")
        predictor = PredictURL()  # Instantiate here
        result = predictor.predict(url)
        print(f"Prediction result: {result}")
        return {
            "url": url,
            "timestamp": datetime.now().isoformat(),
            **result
        }
    except Exception as e:
        print(f"Error processing URL {url}: {type(e).__name__} - {str(e)}")
        return {"error": f"Error analyzing URL: {str(e)}"}
# Add OpenAPI documentation URLs
# Access these at:
# http://127.0.0.1:8000/docs
# http://127.0.0.1:8000/redoc