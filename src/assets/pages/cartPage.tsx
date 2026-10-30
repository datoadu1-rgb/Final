import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { useCart } from "./cart";
import { AuthButton } from "../../shared-components";
import "../catalog.css";

function CartPage() {
  const cart = useCart();
  const auth = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  function handleError(error: unknown) {
    const apiError = error as { code?: string; available?: number };

    if (apiError.code === "INSUFFICIENT_STOCK") {
      setMessage(`Only ${apiError.available} left in stock`);
    } else if (
      apiError.code === "UNAUTHORIZED" ||
      apiError.code === "TOKEN_EXPIRED"
    ) {
      auth.logout();
      cart.clearCart();
      navigate("/login?redirect=/cart");
    } else {
      setMessage("Something went wrong. Please try again.");
    }
  }

  async function handleChangeQty(itemId: string, qty: number) {
    setMessage("");

    try {
      await cart.changeQty(itemId, qty);
    } catch (error) {
      handleError(error);
    }
  }

  async function handleRemove(itemId: string) {
    setMessage("");

    try {
      await cart.removeItem(itemId);
    } catch (error) {
      handleError(error);
    }
  }

  const data = cart.cart;
  const hasStockProblem =
    data !== null && data.items.some((item) => item.qty > item.product.stock);

  return (
    <div className="catalog-page product-page">
      <div className="product-container">
        <div className="product-topbar">
          <Link className="product-back" to="/catalog">
            ← Continue shopping
          </Link>
          <AuthButton />
        </div>

        <h1>Your cart</h1>

        {message && (
          <p className="cart-message cart-message--error">{message}</p>
        )}

        {!data && <p>Loading...</p>}

        {data && data.items.length === 0 && (
          <div className="catalog-message">
            <p className="catalog-message__title">Your cart is empty</p>
            <Link className="cart-link-button" to="/catalog">
              Back to catalog
            </Link>
          </div>
        )}

        {data && data.items.length > 0 && (
          <>
            <div className="cart-list">
              {data.items.map((item) => {
                const maxQty = Math.min(item.product.stock, 99);
                const overStock = item.qty > item.product.stock;

                return (
                  <div key={item.id} className="cart-item">
                    <Link to={"/product/" + item.product.slug}>
                      <img
                        className="cart-item__image"
                        src={item.product.image}
                        alt={item.product.title}
                      />
                    </Link>

                    <div className="cart-item__info">
                      <p className="cart-item__brand">{item.product.brand}</p>

                      <Link
                        className="cart-item__title"
                        to={"/product/" + item.product.slug}
                      >
                        {item.product.title}
                      </Link>

                      <p>
                        {item.product.price} {item.product.currency}
                      </p>

                      {overStock && (
                        <p className="cart-message cart-message--error">
                          Only {item.product.stock} left in stock
                        </p>
                      )}
                    </div>

                    <div className="quantity">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={cart.isBusy || item.qty <= 1}
                        onClick={() => handleChangeQty(item.id, item.qty - 1)}
                      >
                        −
                      </button>

                      <span className="quantity__value">{item.qty}</span>

                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={cart.isBusy || item.qty >= maxQty}
                        onClick={() => handleChangeQty(item.id, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>

                    <p className="cart-item__total">
                      {item.lineTotal} {data.currency}
                    </p>

                    <button
                      type="button"
                      className="cart-item__remove"
                      aria-label={"Remove " + item.product.title}
                      disabled={cart.isBusy}
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <p>Total ({data.totalQty} items)</p>

              <p className="cart-summary__total">
                {data.subtotal} {data.currency}
              </p>

              {/* checkout will be connected here later */}
              <button
                type="button"
                className="add-to-cart"
                disabled={hasStockProblem}
                onClick={() => navigate("/checkout")}
              >
                Go to checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;
