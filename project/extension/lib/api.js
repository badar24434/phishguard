export const WHOIS_API_KEY = 'your_whois_api_key';
export const IPQUALITYSCORE_API_KEY = 'your_ipqualityscore_key';

export async function getWhoisData(domain) {
  try {
    const response = await fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOIS_API_KEY}&domainName=${domain}&outputFormat=JSON`);
    const data = await response.json();
    return {
      country: data.WhoisRecord?.registrant?.country || 'Unknown',
      firstSeen: data.WhoisRecord?.createdDate || 'Unknown',
      host: data.WhoisRecord?.registrarName || 'Unknown'
    };
  } catch (error) {
    console.error('Whois API Error:', error);
    return null;
  }
}

export async function getIPQualityScore(url) {
  try {
    const response = await fetch(`https://ipqualityscore.com/api/json/url/${IPQUALITYSCORE_API_KEY}/${encodeURIComponent(url)}`);
    const data = await response.json();
    return {
      riskScore: data.risk_score,
      suspicious: data.suspicious,
      malicious: data.malicious
    };
  } catch (error) {
    console.error('IPQualityScore API Error:', error);
    return null;
  }
}