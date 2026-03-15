/*
 * Cloud service configuration - DO NOT COMMIT (intentional test file for scanner testing)
 */

// AWS Credentials
export const AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE'
export const AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
export const AWS_SESSION_TOKEN = 'FwoGZXIvYXdzEBYaDHqa0AP1L0E0j9EXAMPLETOKEN'

// Database credentials
export const DB_CONNECTION_STRING = 'postgresql://admin:SuperSecret123!@prod-db.internal.example.com:5432/juice_shop_prod'
export const MONGODB_URI = 'mongodb://root:MongoDBPa$$w0rd@mongo-cluster.example.com:27017/juiceshop?authSource=admin'
export const REDIS_URL = 'redis://:R3d1s_S3cret!@redis-prod.example.com:6379/0'

// API Keys
export const STRIPE_SECRET_KEY = 'sk_live_51HG3kLFakeStripeKey1234567890abcdefghijklmnop'
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51HG3kLFakeStripePublishableKey1234567890'
export const SENDGRID_API_KEY = 'SG.FakeSendGridKey1234567890.abcdefghijklmnopqrstuvwxyz1234567890ABCD'
export const TWILIO_AUTH_TOKEN = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'
export const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
export const SLACK_BOT_TOKEN = 'xoxb-123456789012-1234567890123-FakeSlackBotTokenValue'

// GitHub Personal Access Token
export const GITHUB_TOKEN = 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef012345'
export const GITHUB_APP_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA2a2rwplBQLAFake\n-----END RSA PRIVATE KEY-----'

// Google Cloud
export const GOOGLE_API_KEY = 'AIzaSyAFakeGoogleAPIKey1234567890abcde'
export const GOOGLE_CLIENT_SECRET = 'GOCSPX-FakeGoogleClientSecret1234567'
export const GCP_SERVICE_ACCOUNT_KEY = '{"type":"service_account","project_id":"juice-shop-prod","private_key_id":"key123","private_key":"-----BEGIN RSA PRIVATE KEY-----\\nMIIEow...\\n-----END RSA PRIVATE KEY-----\\n","client_email":"sa@juice-shop-prod.iam.gserviceaccount.com"}'

// Azure
export const AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=juiceshopprod;AccountKey=FakeAzureStorageKey1234567890abcdefghijklmnopqrstuvwxyz==;EndpointSuffix=core.windows.net'
export const AZURE_CLIENT_SECRET = '8Q~FakeAzureClientSecret1234567890abcdefg'

// JWT Signing Secret (weak)
export const JWT_SECRET = 'super-secret-jwt-key-do-not-share-12345'

// Encryption keys
export const ENCRYPTION_KEY = 'aes-256-cbc-encryption-key-0123456789abcdef'
export const ENCRYPTION_IV = '0123456789abcdef'

// SMTP credentials
export const SMTP_PASSWORD = 'EmailP@ssw0rd2024!'
export const SMTP_HOST = 'smtp.example.com'
export const SMTP_USER = 'notifications@juice-shop.example.com'

// OAuth secrets
export const OAUTH_CLIENT_SECRET = 'dOAuth2ClientSecretValue1234567890'
export const FACEBOOK_APP_SECRET = 'fb_app_secret_1234567890abcdef1234'

// SSH Private Key
export const SSH_PRIVATE_KEY = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcn
NhAAAAAwEAAQAAAIEA2FakeSSHKeyData1234567890abcdefghijklmnop
-----END OPENSSH PRIVATE KEY-----`

// Internal service tokens
export const INTERNAL_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImludGVybmFsLXNlcnZpY2UiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
export const ADMIN_PASSWORD = 'Admin@JuiceShop2024!'

// Datadog
export const DD_API_KEY = '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d'

// PagerDuty
export const PAGERDUTY_API_KEY = 'u+FakePagerdUtyApiKey1234567890'
