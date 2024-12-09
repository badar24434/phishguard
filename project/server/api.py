from feature_extraction import PredictURL
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import validators
from datetime import datetime

app = FastAPI()
classifier = PredictURL()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
def predict(url: str = ""):
    if not validators.url(url):
        return {"error": "Invalid URL"}
    
    try:
        result = classifier.predict(url)
        return {
            "url": url,
            "timestamp": datetime.now().isoformat(),
            "isPhishing": result["isPhishing"],
            "confidence": result["confidence"],
            "score": result["confidence"] if result["isPhishing"] else 1 - result["confidence"]
        }
    except Exception as e:
        return {"error": f"Error analyzing URL: {str(e)}"}