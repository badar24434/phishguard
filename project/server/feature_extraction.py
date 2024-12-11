import numpy as np
from urllib.parse import urlparse
import ipaddress
import tldextract
import re
import os
import onnxruntime as ort

class FeatureExtract:
    def __init__(self):
        pass

    def isIP(self, url):
        try:
            ipaddress.ip_address(urlparse(url).netloc)
            return 1
        except:
            return 0
    
    def isat(self, url):
        return 1 if "@" in url else 0
    
    def isRedirect(self, url):
        pos = url.rfind('//')
        return 1 if pos > 7 else 0
    
    def haveDash(self, url):
        return 1 if '-' in urlparse(url).netloc else 0
    
    def no_sub_domain(self, url):
        domain = str(urlparse(url).netloc)
        domain = domain.replace("www.", "")
        domain = domain.replace("." + tldextract.extract(url).suffix, "")
        return 0 if domain.count(".") == 1 else 1
    
    def LongURL(self, url):
        return 1 if len(url) >= 54 else 0
    
    def tinyURL(self, url):
        shortening_services = r"bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd"
        return 1 if re.search(shortening_services, url) else 0

class PredictURL:
    def __init__(self):
        self.model = self._load_model()
        model_inputs = self.model.get_inputs()
        self.input_name = model_inputs[0].name
        print(f"Model input name: {self.input_name}")
        print(f"Model input type: {model_inputs[0].type}")

    def _load_model(self):
        try:
            model_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'model', 'model.onnx')
            session = ort.InferenceSession(model_path)
            print(f"Model input type: {session.get_inputs()[0].type}")
            return session
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise

    def predict(self, url):
        try:
            # Create string tensor from raw URL
            input_tensor = np.array([url], dtype=np.object_)
            print(f"Input tensor shape: {input_tensor.shape}, dtype: {input_tensor.dtype}")
            
            outputs = self.model.run(None, {self.input_name: input_tensor})
            print(f"Model outputs: {outputs}")
            
            # Get probabilities from model output
            probabilities = outputs[1][0]  # array([safe_prob, phish_prob])
            phish_probability = float(probabilities[1])
            
            return {
                "isPhishing": phish_probability > 0.5,
                "confidence": phish_probability  # Raw probability
            }
        except Exception as e:
            print(f"Error in predict(): {str(e)}")
            raise

# Main function
def main():
    import requests
    
    # Test URLs
    test_urls = [
        "https://www.example.com",
        "https://www.google.com",
        "http://suspicious-site.com"
    ]
    
    for url in test_urls:
        print(f"\nTesting URL: {url}")
        try:
            # Test direct feature extraction
            predictor = PredictURL()
            result = predictor.predict(url)
            print(f"Direct prediction result: {result}")
            
            # Test API endpoint
            response = requests.get(f"http://localhost:8001/api?url={url}")
            print(f"API response status: {response.status_code}")
            print(f"API response: {response.json()}")
            
        except Exception as e:
            print(f"Error testing {url}: {str(e)}")

if __name__ == "__main__":
    main()