import json

from anthropic import Anthropic, beta_tool

from .chroma_client import get_collection
from .config import CLAUDE_API_KEY, CLAUDE_MODEL
from .juice_shop_client import fetch_products

client = Anthropic(api_key=CLAUDE_API_KEY)

SYSTEM_PROMPT = (
    "You are the OWASP Juice Shop shopping assistant. You help customers with "
    "product information, pricing, delivery options, and store policies. "
    "Call search_products for authoritative, live product names and current "
    "prices. Call search_knowledge_base for anything else about the store - "
    "delivery options, policies, or general product descriptions - since it "
    "searches curated internal documentation. Always call a tool before "
    "answering a factual question - never guess. If nothing relevant is "
    "found, say so. Politely decline questions that aren't about Juice Shop."
)

# Chroma connection is reused across requests; the collection is created on
# first use by get_collection() (see docker-compose.yml for the Chroma server).
_collection = None


def _knowledge_base():
    global _collection
    if _collection is None:
        _collection = get_collection()
    return _collection

# Per-conversation message history, in the format the Messages API expects.
_conversations: dict[str, list] = {}


@beta_tool
def search_products(query: str) -> str:
    """Search the Juice Shop product catalog by name or description.

    Args:
        query: Keywords to search for, e.g. "juice" or "banana". Pass an
            empty string to list every product currently in stock.
    Returns:
        A JSON string with the matching products, including their price.
    """
    return json.dumps(fetch_products(query))


@beta_tool
def search_knowledge_base(query: str) -> str:
    """Semantically search internal Juice Shop knowledge stored in the RAG
    knowledge base - product details, delivery options, and store policies.

    Args:
        query: A natural-language question, e.g. "how fast is fast delivery"
            or "what juices do you sell".
    Returns:
        A JSON string with the most relevant knowledge base entries.
    """
    results = _knowledge_base().query(query_texts=[query], n_results=5)
    documents = results.get("documents", [[]])[0]
    return json.dumps(documents)


def ask_assistant(conversation_id: str, message: str) -> str:
    history = _conversations.setdefault(conversation_id, [])
    history.append({"role": "user", "content": message})

    runner = client.beta.messages.tool_runner(
        model=CLAUDE_MODEL,
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        tools=[search_products, search_knowledge_base],
        messages=history,
    )
    final_message = runner.until_done()

    history.append({"role": "assistant", "content": final_message.content})
    return "".join(block.text for block in final_message.content if block.type == "text")
