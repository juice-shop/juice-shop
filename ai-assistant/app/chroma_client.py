import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

from .config import CHROMA_COLLECTION, CHROMA_HOST, CHROMA_PORT

# Runs a local ONNX MiniLM model inside this process - no external API key
# or network call needed to embed text.
_embedding_function = DefaultEmbeddingFunction()


def get_collection() -> chromadb.api.models.Collection.Collection:
    client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
    return client.get_or_create_collection(
        name=CHROMA_COLLECTION,
        embedding_function=_embedding_function,
    )
