import os
from pathlib import Path

from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(REPO_ROOT / ".env.claude")

CLAUDE_API_KEY = os.environ["CLAUDE_KEY"]
CLAUDE_MODEL = "claude-opus-4-8"

# Base URL of the running Juice Shop instance the assistant looks up products from.
JUICE_SHOP_BASE_URL = os.environ.get("JUICE_SHOP_BASE_URL", "http://localhost:3000")

# Chroma server started via `docker compose up` (see docker-compose.yml).
CHROMA_HOST = os.environ.get("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.environ.get("CHROMA_PORT", "8000"))
CHROMA_COLLECTION = os.environ.get("CHROMA_COLLECTION", "juice_shop_knowledge")
