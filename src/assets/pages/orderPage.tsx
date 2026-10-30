import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getOrder } from "../../api";
import { AuthButton } from "../../shared-components";
import "../catalog.css";

type Order = {
  id: string;
  status: string;
  items: {
    productId: string;
    slug: string;
    title: string;
    image: string;
    price: number;
    qty: number;
    lineTotal: number;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  shipping: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
  };
  payment?: {
    brand: string;
    last4: string;
  };
  createdAt: string;
  paidAt?: string | null;
};

function OrderShell({ children }: { children: ReactNode }) {
  return (
    <div className="catalog-page product-page checkout-page">
      <div className="product-container">
        <div className="product-topbar">
          <Link className="product-back" to="/catalog">
            ← Back to catalog
          </Link>
          <AuthButton />
        </div>

        {children}
      </div>
    </div>
  );
}

function OrderPage() {
  const { id } = useParams();

  const { data, isLoading, isError, error, refetch } = useQuery<{
    order: Order;
  }>({
    queryKey: ["order", id],
    queryFn: () => getOrder(id ?? ""),
    retry: 1,
  });

  if (isLoading) {
    return (
      <OrderShell>
        <p>Loading...</p>
      </OrderShell>
    );
  }

  if (isError || !data) {
    const code = (error as unknown as { code?: string } | null)?.code;

    if (code === "ORDER_NOT_FOUND") {
      return (
        <OrderShell>
          <div className="catalog-message">
            <p className="catalog-message__title">Order not found</p>
            <Link className="cart-link-button" to="/catalog">
              Back to catalog
            </Link>
          </div>
        </OrderShell>
      );
    }

    return (
      <OrderShell>
        <div className="catalog-message">
          <p className="catalog-message__title">Failed to load the order</p>
          <button type="button" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      </OrderShell>
    );
  }

  const order = data.order;
  const isPaid = order.status === "paid";

  return (
    <OrderShell>
      <div className="order-box">
        {isPaid ? (
          <>
            <h1>Thank you!</h1>
            <p>
              Order #{order.id.slice(-8).toUpperCase()} is paid.
              {order.paidAt &&
                ` Paid on ${new Date(order.paidAt).toLocaleString()}.`}
            </p>
          </>
        ) : (
          <>
            <h1>Payment not completed</h1>
            <p>
              Order #{order.id.slice(-8).toUpperCase()} is waiting for payment.
            </p>
            <Link
              className="cart-link-button"
              to={"/checkout/confirm/" + order.id}
            >
              Enter the code
            </Link>
          </>
        )}

        <section className="checkout-section">
          <h2>Products</h2>

          <ul className="order-items">
            {order.items.map((item) => (
              <li key={item.productId}>
                <img src={item.image} alt={item.title} />

                <Link to={"/product/" + item.slug}>{item.title}</Link>

                <span>× {item.qty}</span>

                <span>
                  {item.lineTotal} {order.currency}
                </span>
              </li>
            ))}
          </ul>

          <div className="checkout-summary__row">
            <span>Subtotal</span>
            <span>
              {order.subtotal} {order.currency}
            </span>
          </div>

          <div className="checkout-summary__row">
            <span>Delivery</span>
            <span>
              {order.shippingFee === 0
                ? "Free"
                : `${order.shippingFee} ${order.currency}`}
            </span>
          </div>

          <div className="checkout-summary__row checkout-summary__total">
            <span>Total</span>
            <span>
              {order.total} {order.currency}
            </span>
          </div>
        </section>

        <section className="checkout-section">
          <h2>Delivery address</h2>

          <p>{order.shipping.fullName}</p>
          <p>{order.shipping.phone}</p>
          <p>
            {order.shipping.address}, {order.shipping.city}
          </p>
        </section>

        {order.payment && (
          <section className="checkout-section">
            <h2>Payment</h2>

            <p>
              {order.payment.brand.toUpperCase()} •••• {order.payment.last4}
            </p>
          </section>
        )}

        <Link className="cart-link-button" to="/catalog">
          Continue shopping
        </Link>
      </div>
    </OrderShell>
  );
}

export default OrderPage;
