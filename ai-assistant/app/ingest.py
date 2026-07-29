"""Populate the Chroma knowledge base from Juice Shop data.

Run with: python -m app.ingest
Requires the Chroma server from docker-compose.yml to be running, and the
Juice Shop app to be reachable at JUICE_SHOP_BASE_URL.
"""

from pathlib import Path

import yaml

from .chroma_client import get_collection
from .juice_shop_client import fetch_products

REPO_ROOT = Path(__file__).resolve().parents[2]
DELIVERIES_FILE = REPO_ROOT / "data" / "static" / "deliveries.yml"

Documents = tuple[list[str], list[str], list[dict]]


def _product_documents() -> Documents:
    ids, docs, metadatas = [], [], []
    for product in fetch_products(""):
        ids.append(f"product-{product['name']}")
        docs.append(
            f"Product: {product['name']}\n"
            f"Price: {product['price']}\n"
            f"Description: {product['description']}"
        )
        metadatas.append({"source": "product_catalog", "name": product["name"]})
    return ids, docs, metadatas


def _delivery_documents() -> Documents:
    deliveries = yaml.safe_load(DELIVERIES_FILE.read_text())
    ids, docs, metadatas = [], [], []
    for delivery in deliveries:
        ids.append(f"delivery-{delivery['name']}")
        docs.append(
            f"Delivery option: {delivery['name']}\n"
            f"Price: {delivery['price']}\n"
            f"Deluxe member price: {delivery['deluxePrice']}\n"
            f"Estimated delivery time: {delivery['eta']} day(s)"
        )
        metadatas.append({"source": "deliveries", "name": delivery["name"]})
    return ids, docs, metadatas


def ingest() -> int:
    collection = get_collection()
    ids: list[str] = []
    docs: list[str] = []
    metadatas: list[dict] = []
    for id_batch, doc_batch, meta_batch in (_product_documents(), _delivery_documents()):
        ids += id_batch
        docs += doc_batch
        metadatas += meta_batch
    collection.upsert(ids=ids, documents=docs, metadatas=metadatas)
    return len(ids)


if __name__ == "__main__":
    count = ingest()
    print(f"Ingested {count} documents into Chroma collection.")
