import ProductCard from "./Product";

type Product = {
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

type ProductListProps = {
  products?: Product[];
};

function ProductList({ products }: ProductListProps) {
  const firstFive = products?.slice(0, 5);
  const rest = products?.slice(5);

  return (
    <>
      <section className="featured-grid">
        {firstFive?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {/* pirveli xuti sxva layout */}
      </section>

      <section className="product-grid">
        {rest?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </>
  );
}
function SkeletonCard() {
  return (
    <article className="skeleton-card">
      <div className="skeleton skeleton-image"></div>
      <div className="skeleton skeleton-line skeleton-line--short"></div>
      <div className="skeleton skeleton-line"></div>
      <div className="skeleton skeleton-line skeleton-line--medium"></div>
    </article>
  );
}

export function ProductSkeletons() {
  const featured = [0, 1, 2, 3, 4];
  const rest = [0, 1, 2, 3, 4, 5, 6];

  return (
    <>
      <section className="featured-grid skeleton-grid">
        {featured.map((number) => (
          <SkeletonCard key={number} />
        ))}
      </section>

      <section className="product-grid skeleton-grid">
        {rest.map((number) => (
          <SkeletonCard key={number} />
        ))}
      </section>
    </>
  );
}
export default ProductList;
