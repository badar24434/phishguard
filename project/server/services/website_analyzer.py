import aiohttp
import os
from dotenv import load_dotenv
import google.generativeai as genai
from sympy import Domain
import pycountry  # Add this import at the top

load_dotenv()

class WebsiteAnalyzer:
    def __init__(self):
        load_dotenv()
        self.whois_api_key = os.getenv('WHOIS_API_KEY')
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=self.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-pro')

    def normalize_country(self, country_str):
        """Normalize country names and codes to a standard format"""
        if not country_str or country_str == 'Unknown':
            return 'Unknown'
            
        # Convert to uppercase for consistency
        country_str = country_str.upper().strip()
        
        # If it's a 2-letter code
        if len(country_str) == 2:
            try:
                return pycountry.countries.get(alpha_2=country_str).name.upper()
            except:
                pass
                
        # If it's a 3-letter code
        if len(country_str) == 3:
            try:
                return pycountry.countries.get(alpha_3=country_str).name.upper()
            except:
                pass
        
        # Try to find by name
        try:
            return pycountry.countries.search_fuzzy(country_str)[0].name.upper()
        except:
            return country_str

    async def fetch_api_data(self, domain):
        async with aiohttp.ClientSession() as session:
            try:
                # Add WHOIS API call
                whois_url = "https://www.whoisxmlapi.com/whoisserver/WhoisService"
                whois_params = {
                    "apiKey": self.whois_api_key,
                    "domainName": domain,
                    "outputFormat": "JSON"
                }
                async with session.get(whois_url, params=whois_params) as resp:
                    if resp.status != 200:
                        error_text = await resp.text()
                        print(f"WHOIS API Error: {error_text}")
                        raise Exception(f"WHOIS API error: {resp.status}")
                    whois_data = await resp.json()

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
                    "dns_lookup": dns_data,
                    "whois": whois_data  # Add WHOIS data to the return
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

    async def generate_summary(self, data):
        try:
            if not self.gemini_api_key:
                raise Exception("Gemini API key not configured")

            # Get scan result from the data
            scan_result = data.get('scan_result', {})
            is_phishing = scan_result.get('isPhishing', False)
            confidence = scan_result.get('confidence', 0)

            # Safe access to categorization data with default empty list
            categories = data.get('categorization', {}).get('categories', [])
            categories_text = "\n".join([
                f"* {category.get('name', 'Unknown')} (Confidence: {category.get('confidence', 'Unknown')})" 
                for category in categories
            ]) if categories else "* No categories available"

            # Get DNS records with safe access
            dns_records = data.get('dns_lookup', {}).get('dnsRecords', [])
            formatted_dns_info = "\n".join(self.format_dns_records(dns_records))

            # Safe access to geolocation data
            geo_data = data.get('geolocation', {})
            location = geo_data.get('location', {})
            geo_country = self.normalize_country(location.get('country', 'Unknown'))
            
            whois_data = data.get('whois', {}).get('WhoisRecord', {})
            whois_registrant = whois_data.get('registrant', {})
            whois_country = self.normalize_country(whois_registrant.get('country', 'Unknown'))

            # Check for location mismatch with normalized countries
            location_mismatch = (geo_country != 'Unknown' and whois_country != 'Unknown' 
                               and geo_country != whois_country)
            
            vpn_warning = ""
            if location_mismatch:
                vpn_warning = f"""
⚠️ **Location Mismatch Detected**
* WHOIS Registration Country: {whois_country}
* Current Server Location: {geo_country}
* This mismatch suggests possible use of VPN or proxy services, which is a common tactic in phishing attacks
"""

            prompt = f"""
Generate a comprehensive security assessment report using the following data.
Use markdown formatting including:
- **Bold** for headers
- Bullet points (*) for listing items
- Proper spacing and sections
- Heading levels (#, ##, ###) for organization

Important Context:
Our AI-powered phishing detection system has analyzed this website and determined it is {'likely a phishing site' if is_phishing else 'likely safe'}.

{vpn_warning if location_mismatch else ''}

Data to analyze:

### Geolocation Information

- **IP Address:** {geo_data.get('ip', 'Unknown')}
- **Current Server Location:**
  * Country: {geo_country}
  * City: {location.get('city', 'Unknown')}
- **Registration Location:**
  * Country: {whois_country}
- **ISP:** {geo_data.get('isp', 'Unknown')}
- **ASN Name:** {geo_data.get('as', {}).get('name', 'Unknown')}
- **Domains Associated:** {', '.join(geo_data.get('domains', []))}
- **Date Created:** {whois_data.get('createdDate', 'Unknown')}
- **Last Updated:** {whois_data.get('updatedDate', 'Unknown')}

### Website Categorization

{categories_text}

Format the response as a professional security report with:

# Security Assessment Report 

## Infrastructure Assessment
If there's a location mismatch between WHOIS and GeoIP data, consider this a potential red flag as it may indicate the use of VPN/proxy services to mask the true location.

## Risk Analysis
Consider our AI detection result: {'HIGH RISK - Potential Phishing Site' if is_phishing else 'LOW RISK - Likely Safe Site'}

## Categorization Review

## Recommendations
{'Given our AI system detected potential phishing behavior, please include specific safety precautions and immediate actions users should take.' + (' The detected location mismatch strongly suggests the use of VPN or proxy services, which is a common tactic in phishing attacks.' if location_mismatch else '') if is_phishing else 'While our AI system indicates this is likely safe, include general web safety best practices.'}

Ensure proper markdown formatting throughout, with blank lines between headers and their content, and avoid any customization from the user.
"""

            response = self.model.generate_content(prompt)
            if not response or not response.text:
                return "Unable to generate summary. Please try again."
            return response.text

        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            return "Error generating security assessment. This could be due to missing or invalid data."

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
