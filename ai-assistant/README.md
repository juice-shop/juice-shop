# AI Shopping Assistant

A standalone FastAPI service that answers product and pricing questions using
OpenAI with retrieval-augmented generation (RAG): product data is embedded
into a ChromaDB vector store (running in Docker) and semantically searched
by the assistant, grounding answers in the real Juice Shop catalog instead
of relying on the model's own knowledge.

## Setup

```bash
cd ai-assistant
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

The OpenAI key is read from `../.env.openai` (variable `OPEN_AI_KEY`), which
already exists at the repo root.

## Run

1. Start the Chroma vector store:

   ```bash
   docker compose up -d
   ```

2. Embed the product catalog (re-run any time product data changes):

   ```bash
   python -m app.ingest
   ```

3. Start the API:

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## Usage

```bash
curl http://localhost:8000/health

curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I want something with tropical fruit flavor"}'
```

Interactive docs: `http://localhost:8000/docs`

## Architecture

- `app/db.py` — read-only SQLite access to `data/juiceshop.sqlite`
- `app/embeddings.py` — wraps OpenAI's embeddings API
- `app/ingest.py` — embeds product name/description into Chroma, run manually
- `app/chroma_client.py` — HTTP client to the Chroma container (port 8001)
- `app/rag.py` — semantic search over the Chroma collection
- `app/assistant.py` — OpenAI tool-calling loop; the model can only answer
  with data it actually retrieved via `search_knowledge_base` (Chroma) or
  `list_all_products` (SQLite), never invented facts
