import fuzz
from models.product import ProductModel
from data.datacache import challenges
import security
import challenge_utils

def product_price(query, user):
    products = ProductModel.find_all()
    queried_products = [
        f"{product.name} costs {product.price}¤"
        for product in products
        if fuzz.partial_ratio(query, product.name) > 60
    ]
    return {
        "action": "response",
        "body": ", ".join(queried_products) if queried_products else "Sorry I couldn't find any products with that name"
    }

def coupon_code(query, user):
    challenge_utils.solve_if(challenges.bullyChatbotChallenge, lambda: True)
    return {
        "action": "response",
        "body": f"Oooookay, if you promise to stop nagging me here's a 10% coupon code for you: {security.generate_coupon(10)}"
    }

def test_function(query, user):
    return {
        "action": "response",
        "body": "3be2e438b7f3d04c89d7749f727bb3bd"
    }
