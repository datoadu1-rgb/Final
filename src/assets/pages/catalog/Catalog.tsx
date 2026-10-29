import { useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getCategory, getProducts } from "../../../api";
import CategoryFilters from "./CategoryFilters";
import ProductList from "./ProductList";
import Pagination from "../../pagination";
import "../../catalog.css";
import { AuthButton } from "../../../shared-components";
import { ProductSkeletons } from "./ProductList";
import { Link } from "react-router-dom";
import { FloatingCart } from "../../../shared-components";
function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  //  aq ewereba queris instuqcia mere apis miscem da amas ikenebs
  const { data: categoryData } = useQuery({
    queryKey: ["category"],
    queryFn: getCategory,
  });

  const {
    data: productsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["products", searchParams.toString()],
    queryFn: () => getProducts(searchParams),
    placeholderData: keepPreviousData,
    retry: 1,
  });

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    searchTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }

      params.set("page", "1");

      setSearchParams(params);
    }, 400);
  }

  function handleSortChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams);

    params.set("sort", event.target.value);
    params.set("page", "1");

    setSearchParams(params);
  }

  function clearFilters() {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    if (searchInput.current) {
      searchInput.current.value = "";
    }

    setSearchParams(new URLSearchParams());
  }

  const currentSearch = searchParams.get("q") ?? "";
  const isEmpty = !!productsData && productsData.items.length === 0;

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <Link className="catalog-brand" to="/catalog">
          TECH<sup>2</sup>HEADS
        </Link>
        <AuthButton />
        <FloatingCart />
      </div>

      {isFilterOpen && (
        <div
          className="catalog-overlay"
          onClick={() => setIsFilterOpen(false)}
        ></div>
        // css stvis
      )}

      <div className="catalog-layout">
        <aside
          className={
            isFilterOpen
              ? "catalog-sidebar catalog-sidebar--open"
              : "catalog-sidebar"
          }
        >
          <div className="catalog-sidebar__content">
            <h2>Advanced Search</h2>

            <CategoryFilters filters={categoryData?.filters} />
          </div>

          <button
            type="button"
            className="catalog-sidebar__toggle"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            Advanced Search
          </button>
        </aside>

        <main
          className="catalog-results"
          style={{
            opacity: isFetching && !isLoading ? 0.5 : 1,
          }}
        >
          <div className="catalog-toolbar">
            <input
              ref={searchInput}
              type="search"
              placeholder="Search products..."
              defaultValue={currentSearch}
              onChange={handleSearchChange}
            />

            <select
              value={searchParams.get("sort") ?? "popular"}
              onChange={handleSortChange}
            >
              <option value="popular">Popular</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating-desc">Rating</option>
              <option value="title-asc">Title: A-Z</option>
            </select>
          </div>{" "}
          <div className="make-your-choice">
            <h1>Browse</h1>
          </div>
          {isLoading && <ProductSkeletons />}
          {isError && (
            <div className="catalog-message">
              <p className="catalog-message__title">Failed to load products</p>
              <p>Check your connection and try again.</p>
              <button type="button" onClick={() => refetch()}>
                Try again
              </button>
            </div>
          )}
          {!isError && isEmpty && (
            <div className="catalog-message">
              <p className="catalog-message__title">Nothing found</p>
              <p>Try different keywords or remove some filters.</p>
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
          {!isError && productsData && !isEmpty && (
            <>
              <ProductList products={productsData.items} />

              <Pagination
                page={productsData.page}
                totalPages={productsData.totalPages}
                total={productsData.total}
                limit={productsData.limit}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Catalog;
