from fastapi import FastAPI, Body, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, validator
import validators
from datetime import datetime
from feature_extraction import PredictURL
import numpy as np
from typing import Optional

from services.website_analyzer import WebsiteAnalyzer

class URLRequest(BaseModel):
    url: str

    @validator('url')
    def validate_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            v = 'https://' + v
        if not validators.url(v):
            raise ValueError('Invalid URL format')
        return v

app = FastAPI(
    title="PhishGuard API",
    description="AI-driven phishing detection API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.post("/api/analyze")
async def analyze_url(request: URLRequest):
    try:
        domain = request.url.split("://")[-1].split("/")[0]
        analyzer = WebsiteAnalyzer()
        
        api_data = await analyzer.fetch_api_data(domain)
        predictor = PredictURL()
        prediction = predictor.predict(request.url)
        summary = await analyzer.generate_summary(api_data, prediction['is_phishing'])
        
        return {
            "status": "success",
            "summary": summary,
            "domain": domain
        }
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))