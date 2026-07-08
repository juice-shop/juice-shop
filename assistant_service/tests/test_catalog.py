import unittest
from pathlib import Path

from app.main import load_product_catalog


class CatalogLoaderTest(unittest.TestCase):
    def test_loads_products_from_juice_shop_config(self) -> None:
        catalog_path = Path(__file__).resolve().parents[1] / ".." / "config" / "default.yml"
        products = load_product_catalog(catalog_path)

        self.assertGreater(len(products), 0)
        self.assertTrue(any(product["name"] == "Apple Juice (1000ml)" for product in products))
        self.assertIn("price", products[0])


if __name__ == "__main__":
    unittest.main()
