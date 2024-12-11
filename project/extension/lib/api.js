export const WHOIS_API_KEY = '';
export const IPQUALITYSCORE_API_KEY = 'your_ipqualityscore_key';

export async function getWhoisData(domain) {
  try {
    const response = await fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOIS_API_KEY}&domainName=${domain}&outputFormat=JSON`);
    
    // Add error logging
    if (!response.ok) {
      console.error('WHOIS API Response:', {
        status: response.status,
        statusText: response.statusText
      });
      const errorData = await response.text();
      console.error('Error response:', errorData);
      throw new Error(`WHOIS API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('WHOIS API Response:', data); // Add this debug log
    
    // Extract specific fields from the WHOIS record
    return {
      country: data.WhoisRecord?.registrant?.country || 'Unknown',
      firstSeen: new Date(data.WhoisRecord?.createdDate).toLocaleDateString() || 'Unknown',
      host: data.WhoisRecord?.registrant?.organization || domain,
      rawData: data // Keep raw data for debugging
    };
  } catch (error) {
    console.error('WHOIS API Error Details:', {
      message: error.message,
      stack: error.stack
    });
    return {
      country: 'Unknown',
      firstSeen: 'Unknown',
      host: domain,
      rawData: null
    };
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