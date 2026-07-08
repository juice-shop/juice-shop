# Product Assistant API

A small FastAPI service that exposes a chat endpoint for product information and pricing questions.

## Run locally

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Make sure your OpenAI key is available in the workspace environment file `.env.openai`.
3. Start the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## Example

```bash
curl -X POST http://127.0.0.1:8000/assistant \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the price of the Smart Watch?"}'
```
