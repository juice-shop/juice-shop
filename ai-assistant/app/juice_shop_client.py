import httpx

from .config import JUICE_SHOP_BASE_URL


def fetch_products(query: str) -> list[dict]:
    """Look up products from the running Juice Shop instance.

    An empty query returns every product in the catalog.
    """
    response = httpx.get(
        f"{JUICE_SHOP_BASE_URL}/rest/products/search",
        params={"q": query},
        timeout=10.0,
    )
    response.raise_for_status()
    products = response.json().get("data", [])
    return [
        {
            "name": product.get("name"),
            "price": product.get("price"),
            "deluxePrice": product.get("deluxePrice"),
            "description": product.get("description"),
        }
        for product in products
    ]
