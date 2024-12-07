// Based on the model from the GitHub repository
export interface FeatureExtraction {
  length_url: number;
  length_hostname: number;
  ip_present: boolean;
  nb_dots: number;
  nb_hyphens: number;
  nb_at: number;
  nb_qm: number;
  nb_and: number;
  nb_eq: number;
  nb_underscore: number;
  nb_tilde: number;
  nb_percent: number;
  nb_slash: number;
  nb_star: number;
  nb_colon: number;
  nb_comma: number;
  nb_semicolumn: number;
  nb_dollar: number;
  nb_space: number;
  nb_www: number;
  nb_com: number;
  nb_dslash: number;
  http_in_path: boolean;
  https_token: boolean;
  ratio_digits_url: number;
  ratio_digits_host: number;
  punycode: boolean;
  port: boolean;
  tld_in_path: boolean;
  tld_in_subdomain: boolean;
  abnormal_subdomain: boolean;
  nb_subdomains: number;
  prefix_suffix: boolean;
  random_domain: boolean;
  shortening_service: boolean;
  path_extension: boolean;
}

export interface ScanResult {
  url: string;
  timestamp: string;
  score: number;
  features: FeatureExtraction;
  isPhishing: boolean;
  confidence: number;
}

const SHORTENING_SERVICES = [
  'bit.ly', 'goo.gl', 'tinyurl.com', 't.co', 'ow.ly'
];

export function extractFeatures(url: string): FeatureExtraction {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;
  
  return {
    length_url: url.length,
    length_hostname: hostname.length,
    ip_present: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname),
    nb_dots: (url.match(/\./g) || []).length,
    nb_hyphens: (url.match(/-/g) || []).length,
    nb_at: (url.match(/@/g) || []).length,
    nb_qm: (url.match(/\?/g) || []).length,
    nb_and: (url.match(/&/g) || []).length,
    nb_eq: (url.match(/=/g) || []).length,
    nb_underscore: (url.match(/_/g) || []).length,
    nb_tilde: (url.match(/~/g) || []).length,
    nb_percent: (url.match(/%/g) || []).length,
    nb_slash: (url.match(/\//g) || []).length,
    nb_star: (url.match(/\*/g) || []).length,
    nb_colon: (url.match(/:/g) || []).length,
    nb_comma: (url.match(/,/g) || []).length,
    nb_semicolumn: (url.match(/;/g) || []).length,
    nb_dollar: (url.match(/\$/g) || []).length,
    nb_space: (url.match(/ /g) || []).length,
    nb_www: (url.match(/www/g) || []).length,
    nb_com: (url.match(/com/g) || []).length,
    nb_dslash: (url.match(/\/\//g) || []).length,
    http_in_path: urlObj.pathname.includes('http'),
    https_token: url.includes('https'),
    ratio_digits_url: (url.match(/\d/g) || []).length / url.length,
    ratio_digits_host: (hostname.match(/\d/g) || []).length / hostname.length,
    punycode: hostname.startsWith('xn--'),
    port: urlObj.port !== '',
    tld_in_path: false, // Simplified implementation
    tld_in_subdomain: false, // Simplified implementation
    abnormal_subdomain: hostname.split('.').length > 3,
    nb_subdomains: hostname.split('.').length - 1,
    prefix_suffix: hostname.includes('-'),
    random_domain: Math.random() < 0.1, // Simplified implementation
    shortening_service: SHORTENING_SERVICES.some(service => hostname.includes(service)),
    path_extension: /\.(html|php|asp|jsp)$/.test(urlObj.pathname),
  };
}

export async function scanUrl(url: string): Promise<ScanResult> {
  try {
    const features = extractFeatures(url);
    
    // Simplified scoring mechanism
    const suspiciousFeatures = [
      features.ip_present,
      features.https_token,
      features.punycode,
      features.abnormal_subdomain,
      features.prefix_suffix,
      features.random_domain,
      features.shortening_service,
      features.http_in_path,
      features.tld_in_path,
      features.tld_in_subdomain,
    ].filter(Boolean).length;
    
    const score = suspiciousFeatures / 10;
    const isPhishing = score > 0.5;
    
    return {
      url,
      timestamp: new Date().toISOString(),
      score,
      features,
      isPhishing,
      confidence: Math.abs(0.5 - score) * 2,
    };
  } catch (error) {
    throw new Error('Invalid URL or scanning error');
  }
}