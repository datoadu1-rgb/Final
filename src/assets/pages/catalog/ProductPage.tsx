import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../../../api";
import ProductCard from "./Product";
import type { Product } from "./Product";
import "../../catalog.css";
import { useAuth } from "../../../auth";
import { useCart } from "../cart";
import { FloatingCart } from "../../../shared-components";
type ProductDetails = Product & {
  warrantyMonths: number;
  images: string[];
  specs: Record<string, string>;
  related: Product[];
};

// the server sends the spec names in Georgian, this shows them in English
const specLabels: Record<string, string> = {
  პროცესორი: "Processor",
  "ოპერატიული მეხსიერება": "RAM",
  დისკი: "Storage",
  ეკრანი: "Screen",
  ვიდეობარათი: "Graphics card",
  კლავიატურა: "Keyboard",
  პორტები: "Ports",
  ბატარეა: "Battery",
  წონა: "Weight",
  "ოპერაციული სისტემა": "Operating system",
  გარანტია: "Warranty",
};

// record?
const valueWords: Record<string, string> = {
  თვე: "months",
  კგ: "kg",
  განათებული: "Backlit",
  ქართული: "Georgian",
  სტანდარტული: "Standard",
};

function translateValue(value: string) {
  let result = value;

  Object.keys(valueWords).forEach((word) => {
    result = result.replaceAll(word, valueWords[word]);
  });

  return result;
}

// kvela produktze
function ProductPage() {
  const { slug } = useParams();

  return <ProductDetailsView key={slug} slug={slug ?? ""} />;
}

function ProductDetailsView({ slug }: { slug: string }) {
  const [selectedImage, setSelectedImage] = useState(0);

  const [quantity, setQuantity] = useState(1);

  const auth = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [cartMessage, setCartMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<ProductDetails>({
    queryKey: ["product", slug],
    queryFn: () => getProduct(slug),
  });

  // tavi
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  if (isLoading) {
    return (
      <div className="catalog-page product-page">
        <div className="product-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="catalog-page product-page">
        <div className="product-container">
          <Link className="product-back" to="/catalog">
            ← Back to catalog
          </Link>
          <p>Product not found</p>
        </div>
      </div>
    );
  }

  const hasDiscount =
    product.oldPrice != null && product.discountPercent != null;
  //    maximum raodenoba backendis mixedvit
  const maxQuantity = Math.min(product.stock, 99);

  const handleAddToCart = async () => {
    // guests go to login, and come back to this product afterwards
    if (auth.status !== "authenticated") {
      navigate("/login?redirect=/product/" + product.slug);
      return;
    }

    setCartMessage(null);

    try {
      await cart.addToCart(product.id, quantity);
      setCartMessage({ text: "Added to cart", type: "success" });
    } catch (error) {
      const apiError = error as { code?: string; available?: number };

      if (apiError.code === "INSUFFICIENT_STOCK") {
        setCartMessage({
          text: `Only ${apiError.available} left in stock`,
          type: "error",
        });
      } else if (apiError.code === "OUT_OF_STOCK") {
        setCartMessage({ text: "Out of stock", type: "error" });
      } else if (apiError.code === "PRODUCT_NOT_FOUND") {
        setCartMessage({
          text: "This product no longer exists",
          type: "error",
        });
      } else if (
        apiError.code === "UNAUTHORIZED" ||
        apiError.code === "TOKEN_EXPIRED"
      ) {
        auth.logout();
        navigate("/login?redirect=/product/" + product.slug);
      } else {
        setCartMessage({
          text: "Something went wrong. Please try again.",
          type: "error",
        });
      }
    }
  };

  return (
    <div className="catalog-page product-page">
      <div className="product-container">
        <Link className="product-back" to="/catalog">
          ← Back to catalog
        </Link>

        <div className="product-layout">
          <div className="product-gallery">
            <img
              className="product-gallery__main"
              src={product.images[selectedImage]}
              alt={product.title}
            />

            <div className="product-gallery__thumbs">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  className={
                    index === selectedImage
                      ? "product-gallery__thumb product-gallery__thumb--active"
                      : "product-gallery__thumb"
                  }
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.title} ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="product-info">
            <p className="product-info__brand">{product.brand}</p>

            <h1>{product.title}</h1>

            <p>
              ★ {product.rating} ({product.reviewsCount} reviews)
            </p>

            <p className="product-info__price">
              <span className="product-info__price-current">
                {product.price} {product.currency}
              </span>

              {hasDiscount && (
                <>
                  <span className="product-info__price-old">
                    {product.oldPrice} {product.currency}
                  </span>
                  <span className="product-info__discount">
                    -{product.discountPercent}%
                  </span>
                </>
              )}
            </p>

            <p>
              {product.inStock ? `${product.stock} in stock` : "Out of stock"}
              {" · "}
              Warranty: {product.warrantyMonths} months
            </p>

            <div className="product-buy">
              <div className="quantity">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={!product.inStock || quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                >
                  −
                </button>

                <span className="quantity__value">{quantity}</span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={!product.inStock || quantity >= maxQuantity}
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>

              {/* ak wava karzinka */}
              <button
                type="button"
                className="add-to-cart"
                disabled={!product.inStock || cart.isBusy}
                onClick={handleAddToCart}
              >
                {cart.isBusy ? "Adding..." : "Add to cart"}
              </button>

              {cartMessage && (
                <p className={`cart-message cart-message--${cartMessage.type}`}>
                  {cartMessage.text}
                  {cartMessage.type === "success" && (
                    <>
                      {" · "}
                      <Link to="/cart">View cart</Link>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="product-specs">
          <h2>Specifications</h2>

          <table className="specs-table">
            <tbody>
              {Object.keys(product.specs).map((key) => (
                <tr key={key}>
                  <th>{specLabels[key] ?? key}</th>
                  <td>{translateValue(product.specs[key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {product.related.length > 0 && (
          <div className="product-related catalog-results">
            {/* dabla sxva produktebi linkebit */}
            <h2>Similar products</h2>

            <div className="related-grid">
              {product.related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
      <FloatingCart />
    </div>
  );
}

export default ProductPage;
