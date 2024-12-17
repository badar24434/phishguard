---

# **PhishGuard**  
### **AI-Powered Phishing Detection and Security Recommendations**

PhishGuard is a comprehensive browser extension designed to detect phishing websites in real-time, provide actionable insights, and recommend security tools like password managers, secure browsing tools,MFA apps and many more to enhance online safety.

---

## **Features**  
- **Real-Time Phishing Detection**: Instantly flags malicious and suspicious websites using AI-powered models.  
- **Comprehensive Security Analysis**:  
  - WHOIS domain verification  
  - Geolocation mismatch analysis  
  - DNS record validation  
  - Website categorization  
- **AI-Powered Risk Assessment**: Generates clear, human-readable security reports with AI.  
- **Tool Recommendations**: Suggests trusted security tools like password managers, VPNs, and MFA apps based on detected threats.  
- **Browser Extension**: Seamless integration with real-time alerts and warnings.  
- **User Monitoring**: Tracks scan history, trends, and threat statistics for continuous security awareness.  

---

## **Technologies Used**  
- **Frontend**: NextJs, Typescript, TailwindCSS  
- **Backend**: NextJs, Python  
- **Machine Learning**: TensorFlow, ONNX  
- **AI Integration**: Gemini API  
- **Data Management**: Local Storage  
- **APIs**: WHOIS API, Geolocation API, DNS Lookup API , Website Categorization API
- **Browser Integration**: Manifest V3 (Chrome Extension)  

---

## **Installation**  

### **Clone the Repository**  
```bash
git clone 
```

### **Setup and Install Dependencies**  

**Backend**  
```bash
cd project/server
pip install -r requirements.txt
python -m uvicorn api:app --host 127.0.0.1 --port 8001
```

**Frontend**  
```bash
cd project
npm install
npm run dev
```

### **Load the Extension**  
1. Build the frontend using `npm run build`.  
2. Open your browser and navigate to `chrome://extensions` (or equivalent for your browser).  
3. Enable Developer Mode.  
4. Load the build folder as an unpacked extension.

---

## **Usage**  
1. For extension: Install the extension and open the popup from the browser toolbar.  
2. For Dashboard: Enter a website URL to scan for phishing risks.  
   If a threat is detected:  
   - View a comprehensive AI security report.  
   - Receive recommendations for tools like password managers, VPNs, and MFA apps to strengthen your security.  
   - Monitor scan history and trends via the dashboard.


---

## **License**  
This project is licensed under the **MIT License**.

---

## **Links**  
- **Live Demo**: [https://phishguard.live](https://phishguard.live)  
- **GitHub Repository**: [https://github.com/yourusername/phishguard](https://github.com/yourusername/phishguard)  
- **Video Demo**: [Watch the Demo](https://loom.com/share/your-demo-link)

---

Let me know if you'd like me to customize any part further! 🚀
