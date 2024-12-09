import numpy as np
from urllib.parse import urlparse
import ipaddress
import tldextract
import re
import pickle

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

class PredictURL(FeatureExtract):
    def __init__(self):
        super().__init__()
        self.model = self._load_model()
    
    def _load_model(self):
        with open('phishing_classifier.pkl', 'rb') as f:
            return pickle.load(f)
    
    def predict(self, url):
        features = self._extract_features(url)
        feature_array = np.array(features).reshape(1, -1)
        prediction = self.model.predict(feature_array)[0]
        confidence = self.model.predict_proba(feature_array)[0]
        
        return {
            "isPhishing": bool(prediction),
            "confidence": float(confidence[1] if prediction else confidence[0])
        }
    
    def _extract_features(self, url):
        return [
            self.isIP(url),
            self.isat(url),
            self.isRedirect(url),
            self.haveDash(url),
            self.no_sub_domain(url),
            self.LongURL(url),
            self.tinyURL(url)
        ]

# Main function
def main():
    pass

if __name__ == "__main__":
    main()