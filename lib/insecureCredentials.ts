/**
 * INSECURE PRACTICE DEMONSTRATION - DO NOT USE IN PRODUCTION
 * 
 * This file contains deliberately insecure practices for educational purposes.
 * It demonstrates what NOT to do with sensitive credentials.
 * 
 * WARNING: Never store API keys or secrets directly in your code like this!
 */

export const insecureCredentials = {
  // DO NOT COPY THIS APPROACH - Hardcoded API keys should never be in source code
  aws: {
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    region: 'us-west-2'
  },
  
  google: {
    apiKey: 'AIzaSyDOCAbC123dEf456GhI789jKl012-MnO',
    clientId: '012345678901-abcdefghijklmnopqrstuvwxyz12345.apps.googleusercontent.com',
    clientSecret: 'GOCSPX-abcdefghijklmnopqrstuvwxyz12345'
  },
  
  stripe: {
    secretKey: 'sk_test_51ABCDEFGhIjKlMnOpQrStUvWxYz0123456789abcdefghijklmnopqrstuvwxyz',
    publishableKey: 'pk_test_51ABCDEFGhIjKlMnOpQrStUvWxYz0123456789abcdefghijklmnopqrstuvwxyz'
  }
};

/**
 * INSECURE: This function demonstrates an insecure way of fetching credentials
 */
export function getCredentials(service: string) {
  return insecureCredentials[service as keyof typeof insecureCredentials];
}

/**
 * INSECURE: This function demonstrates an unsafe way to initialize AWS services
 */
export function initializeAWS() {
  console.log('Initializing AWS with hardcoded credentials (DEMO - DO NOT DO THIS)');
  console.log(`Access Key ID: ${insecureCredentials.aws.accessKeyId}`);
  console.log(`Secret Access Key: ${insecureCredentials.aws.secretAccessKey}`);
  
  return {
    s3Client: {
      // Simulating S3 client initialization with hardcoded credentials
      bucket: 'demo-bucket',
      accessKeyId: insecureCredentials.aws.accessKeyId,
      secretAccessKey: insecureCredentials.aws.secretAccessKey
    }
  };
}

/**
 * INSECURE: This function demonstrates an unsafe way to initialize Google services
 */
export function initializeGoogleAPI() {
  console.log('Initializing Google API with hardcoded API key (DEMO - DO NOT DO THIS)');
  console.log(`API Key: ${insecureCredentials.google.apiKey}`);
  
  return {
    apiKey: insecureCredentials.google.apiKey,
    clientId: insecureCredentials.google.clientId,
    clientSecret: insecureCredentials.google.clientSecret
  };
}