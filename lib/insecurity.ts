```typescript
import process from 'process'

export const hmac = (data: string) => {
  const secretKey = process.env.HMAC_KEY
  if (!secretKey) {
    throw new Error('Missing HMAC key in environment variables')
  }
  return crypto.createHmac('sha256', secretKey).update(data).digest('hex')
}
```