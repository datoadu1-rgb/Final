import { Link } from "react-router-dom";

export type Product = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  inStock: boolean;
  image: string;
};

type ProductCardProps = {
  product: Product;
};

function ProductCard({ product }: ProductCardProps) {
  return (
    <article>
      <Link to={`/product/${product.slug}`}>
        <div
          style={{
            aspectRatio: "4 / 3",
            overflow: "hidden",
          }}
        >
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </Link>

      <p>{product.brand}</p>

      <h2>
        <Link to={`/product/${product.slug}`}>{product.title}</Link>
      </h2>

      <div>
        <strong>
          {product.price} {product.currency}
        </strong>

        {product.oldPrice != null && (
          <span>
            {" "}
            <s>
              {product.oldPrice} {product.currency}
            </s>
          </span>
        )}

        {product.discountPercent != null && (
          <span> -{product.discountPercent}%</span>
        )}
      </div>

      <div>
        <span>★ {product.rating}</span>

        <span> ({product.reviewsCount} reviews)</span>
      </div>

      <div>
        {product.inStock ? `${product.stock} in stock` : "Out of stock"}
      </div>
    </article>
  );
}

export default ProductCard;
