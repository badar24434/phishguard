import aiohttp
import os
from dotenv import load_dotenv
import google.generativeai as genai
from datetime import datetime

load_dotenv()

class WebsiteAnalyzer:
    def __init__(self):
        load_dotenv()
        self.whois_api_key = os.getenv('WHOIS_API_KEY')
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=self.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-pro')

    async def fetch_api_data(self, domain):
        async with aiohttp.ClientSession() as session:
            try:
                # 1. IP Geolocation API
                geo_url = "https://ip-geolocation.whoisxmlapi.com/api/v1"
                geo_params = {
                    "apiKey": self.whois_api_key,
                    "domain": domain
                }
                async with session.get(geo_url, params=geo_params) as resp:
                    if resp.status != 200:
                        error_text = await resp.text()
                        print(f"Geo API Error: {error_text}")
                        raise Exception(f"Geolocation API error: {resp.status}")
                    geo_data = await resp.json()

                # 2. Website Categorization API
                cat_url = "https://website-categorization.whoisxmlapi.com/api/v3"
                cat_params = {
                    "apiKey": self.whois_api_key,
                    "url": domain
                }
                async with session.get(cat_url, params=cat_params) as resp:
                    if resp.status != 200:
                        error_text = await resp.text()
                        print(f"Categorization API Error: {error_text}")
                        raise Exception(f"Categorization API error: {resp.status}")
                    cat_data = await resp.json()

                # 3. DNS Lookup API 
                dns_url = "https://www.whoisxmlapi.com/whoisserver/DNSService"
                dns_params = {
                    "apiKey": self.whois_api_key,
                    "domainName": domain,
                    "type": "_all",
                    "outputFormat": "JSON"
                }
                async with session.get(dns_url, params=dns_params) as resp:
                    if resp.status != 200:
                        error_text = await resp.text()
                        print(f"DNS API Error: {error_text}")
                        raise Exception(f"DNS API error: {resp.status}")
                    dns_data = await resp.json()

                print("API Responses:")
                print(f"Domain: {domain}")
                print("Geo Data:", geo_data)
                print("Cat Data:", cat_data)
                print("DNS Data:", dns_data)

                return {
                    "geolocation": geo_data,
                    "categorization": cat_data,
                    "dns_lookup": dns_data
                }

            except Exception as e:
                print(f"API fetch error: {str(e)}")
                raise Exception(f"API fetch error: {str(e)}")

    def format_dns_records(self, records):
        formatted_records = []
        for record in records:
            dns_type = record.get("dnsType", "Unknown")
            if (dns_type == "A"):
                formatted_records.append(f"* A Record: {record.get('address', 'Unknown')}")
            elif (dns_type == "TXT"):
                formatted_records.append(f"* TXT Record: {', '.join(record.get('strings', []))}")
            elif (dns_type == "SOA"):
                formatted_records.append(
                    f"* SOA Record: Host={record.get('host', 'Unknown')}, Admin={record.get('admin', 'Unknown')}, "
                    f"Serial={record.get('serial', 'Unknown')}, Refresh={record.get('refresh', 'Unknown')}, "
                    f"Retry={record.get('retry', 'Unknown')}, Expire={record.get('expire', 'Unknown')}, "
                    f"Minimum TTL={record.get('minimum', 'Unknown')}"
                )
            elif (dns_type == "MX"):
                formatted_records.append(
                    f"* MX Record: Priority={record.get('priority', 'Unknown')}, Target={record.get('target', 'Unknown')}"
                )
            else:
                formatted_records.append(f"* {dns_type} Record: {record.get('rawText', 'Unknown')}")
        return formatted_records

    async def generate_summary(self, data, is_phishing):
        try:
            if not self.gemini_api_key:
                raise Exception("Gemini API key not configured")

            # Get DNS records directly from the response
            dns_records = data['dns_lookup'].get('dnsRecords', [])
            formatted_dns_info = "\n".join(self.format_dns_records(dns_records))

            # Get current date and time
            generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # Adjust recommendations based on ML phishing detection result
            if is_phishing:
                advisory = "### Important Advisory\n\n" \
                           "Although the website data seems normal, our machine learning model detected potential phishing activity on this site. Please proceed with extreme caution."
            else:
                advisory = "### Advisory\n\n" \
                           "The website appears to be safe based on the data analyzed. However, always exercise caution when browsing the internet."

            prompt = f"""
Generate a comprehensive security assessment report using the following data.
Use markdown formatting including:
- **Bold** for headers
- Bullet points (*) for listing items
- Proper spacing and sections
- Heading levels (#, ##, ###) for organization

Ensure that there is a blank line after each header and before its content, and between paragraphs.

Data to analyze:

### Geolocation Information

- **IP Address:** {data['geolocation'].get('ip', 'Unknown')}
- **Country:** {data['geolocation'].get('location', {}).get('country', 'Unknown')}
- **City:** {data['geolocation'].get('location', {}).get('city', 'Unknown')}
- **ISP:** {data['geolocation'].get('isp', 'Unknown')}
- **ASN Name:** {data['geolocation'].get('as', {}).get('name', 'Unknown')}
- **Domains Associated:** {', '.join(data['geolocation'].get('domains', []))}

### Website Categorization

- **Categories:**
{chr(10).join(['* ' + category['name'] + f" (Confidence: {category['confidence']})" for category in data['categorization'].get('categories', [])])}

{advisory}

Format the response as a professional security report with:

# Security Assessment Report 

## Infrastructure Assessment

## Risk Analysis

## Categorization Review

## Recommendations

Ensure proper markdown formatting throughout, with blank lines between headers and their content, and avoid any customization from the user.

At the end of the report, add a footer:

*Generated by PhishGuard at {generated_at}*
"""

            response = self.model.generate_content(prompt)
            return response.text

        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            raise Exception(f"Gemini API error: {str(e)}")

    async def test_gemini_connection(self):
        try:
            test_prompt = "Write 'Hello' if you can receive this message."
            response = self.model.generate_content(test_prompt)
            
            if response and response.text:
                return {
                    "status": "success",
                    "message": "Gemini API is working",
                    "response": response.text
                }
            else:
                return {
                    "status": "error", 
                    "message": "No response from Gemini"
                }
                
        except Exception as e:
            return {
                "status": "error",
                "message": f"Gemini API error: {str(e)}"
            }