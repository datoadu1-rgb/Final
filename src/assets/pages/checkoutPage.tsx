/* eslint-disable react-hooks/refs */
import { useState } from "react";
import type { ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { createOrder, getCheckout } from "../../api";
import { useAuth } from "../../auth";
import { AuthButton, Button, FormField, Input } from "../../shared-components";
import type { CartItem } from "./cart";
import "../catalog.css";

type CheckoutData = {
  items: CartItem[];
  totalQty: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  freeShippingFrom: number;
  shipping?: {
    fullName?: string;
    phone?: string;
    city?: string;
    address?: string;
  };
};

// ---------- card helpers ----------

// Luhn check: a checksum that catches typos in a card number
function isValidCardNumber(value: string) {
  const digits = value.replace(/\s/g, "");

  if (!/^\d{13,19}$/.test(digits)) {
    return false;
  }

  let sum = 0;
  let double = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);

    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }

    sum += n;
    double = !double;
  }

  return sum % 10 === 0;
}

function isValidExpiry(value: string) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // a card is valid until the end of its expiry month
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

// 4242424242424242 -> 4242 4242 4242 4242
function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 19);

  return digits.replace(/(.{4})/g, "$1 ").trim();
}

// 1228 -> 12/28 (the slash is not re-added while the user is deleting)
function formatExpiry(value: string, isDeleting: boolean) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length > 2) {
    return digits.slice(0, 2) + "/" + digits.slice(2);
  }

  if (digits.length === 2 && !isDeleting) {
    return digits + "/";
  }

  return digits;
}

// ---------- validation rules ----------

const checkoutSchema = z.object({
  shipping: z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    phone: z
      .string()
      .min(9, "Enter a valid phone number")
      .max(20, "Enter a valid phone number")
      .regex(/^\+?[\d\s()-]+$/, "Enter a valid phone number"),
    city: z.string().min(1, "City is required"),
    address: z.string().min(5, "Address must be at least 5 characters"),
  }),
  card: z.object({
    number: z.string().refine(isValidCardNumber, "Enter a valid card number"),
    holder: z.string().min(2, "Enter the name on the card"),
    expiry: z
      .string()
      .refine(isValidExpiry, "Enter a valid expiry date (MM/YY)"),
    cvc: z.string().regex(/^\d{3,4}$/, "CVC must be 3 or 4 digits"),
  }),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

// ---------- the page: loads the data, then shows the form ----------

function CheckoutPage() {
  const { data, isLoading, isError, refetch } = useQuery<CheckoutData>({
    queryKey: ["checkout"],
    queryFn: getCheckout,
    gcTime: 0,
  });

  if (isLoading) {
    return (
      <div className="catalog-page product-page checkout-page">
        <div className="product-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="catalog-page product-page checkout-page">
        <div className="product-container">
          <div className="catalog-message">
            <p className="catalog-message__title">Failed to load checkout</p>
            <button type="button" onClick={() => refetch()}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // nothing to buy → back to the cart
  if (data.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return <CheckoutForm data={data} />;
}

// ---------- the form ----------

function CheckoutForm({ data }: { data: CheckoutData }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const [cardError, setCardError] = useState("");
  const [formError, setFormError] = useState("");

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping: {
        fullName: data.shipping?.fullName ?? "",
        phone: data.shipping?.phone ?? "",
        city: data.shipping?.city ?? "",
        address: data.shipping?.address ?? "",
      },
      card: { number: "", holder: "", expiry: "", cvc: "" },
    },
  });

  const fullNameField = form.register("shipping.fullName");
  const phoneField = form.register("shipping.phone");
  const cityField = form.register("shipping.city");
  const addressField = form.register("shipping.address");
  const numberField = form.register("card.number");
  const holderField = form.register("card.holder");
  const expiryField = form.register("card.expiry");
  const cvcField = form.register("card.cvc");

  const errors = form.formState.errors;
  const isLoading = form.formState.isSubmitting;

  function handleNumberChange(event: ChangeEvent<HTMLInputElement>) {
    event.target.value = formatCardNumber(event.target.value);
    numberField.onChange(event);
  }

  function handleExpiryChange(event: ChangeEvent<HTMLInputElement>) {
    const isDeleting = String(
      (event.nativeEvent as InputEvent).inputType,
    ).startsWith("delete");

    event.target.value = formatExpiry(event.target.value, isDeleting);
    expiryField.onChange(event);
  }

  function handleCvcChange(event: ChangeEvent<HTMLInputElement>) {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 4);
    cvcField.onChange(event);
  }

  async function onSubmit(values: CheckoutValues) {
    setCardError("");
    setFormError("");

    try {
      const order = await createOrder(values);

      // card data must not stay anywhere, so the card fields are emptied
      form.setValue("card", { number: "", holder: "", expiry: "", cvc: "" });

      // the order id goes in the URL, so F5 on the code screen keeps it
      navigate("/checkout/confirm/" + order.orderId);
    } catch (error) {
      const apiError = error as {
        code?: string;
        errors?: Record<string, string>;
      };

      if (apiError.code === "CARD_DECLINED") {
        setCardError("Card declined. Please try another card.");
      } else if (apiError.code === "VALIDATION_ERROR" && apiError.errors) {
        const serverErrors = apiError.errors;

        // keys like "card.number" match our nested field names
        Object.keys(serverErrors).forEach((key) => {
          form.setError(key as FieldPath<CheckoutValues>, {
            message: serverErrors[key],
          });
        });
      } else if (apiError.code === "CART_EMPTY") {
        navigate("/cart");
      } else if (apiError.code === "INSUFFICIENT_STOCK") {
        setFormError("Some products are no longer available in this quantity.");
      } else if (
        apiError.code === "UNAUTHORIZED" ||
        apiError.code === "TOKEN_EXPIRED"
      ) {
        auth.logout();
        navigate("/login?redirect=/checkout");
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  }

  const missingForFreeShipping = data.freeShippingFrom - data.subtotal;

  return (
    <div className="catalog-page product-page checkout-page">
      <div className="product-container">
        <div className="product-topbar">
          <Link className="product-back" to="/cart">
            ← Back to cart
          </Link>
          <AuthButton />
        </div>

        <h1>Checkout</h1>

        <div className="checkout-layout">
          <form
            className="checkout-form"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <section className="checkout-section">
              <h2>Delivery</h2>

              <FormField
                label="Full name"
                htmlFor="fullName"
                error={errors.shipping?.fullName?.message}
              >
                <Input
                  id="fullName"
                  name={fullNameField.name}
                  onChange={fullNameField.onChange}
                  ref={fullNameField.ref}
                  disabled={isLoading}
                  error={!!errors.shipping?.fullName}
                  autoComplete="name"
                />
              </FormField>

              <div className="checkout-row">
                <FormField
                  label="Phone"
                  htmlFor="phone"
                  error={errors.shipping?.phone?.message}
                >
                  <Input
                    id="phone"
                    name={phoneField.name}
                    onChange={phoneField.onChange}
                    ref={phoneField.ref}
                    disabled={isLoading}
                    error={!!errors.shipping?.phone}
                    placeholder="+995 555 12 34 56"
                    autoComplete="tel"
                  />
                </FormField>

                <FormField
                  label="City"
                  htmlFor="city"
                  error={errors.shipping?.city?.message}
                >
                  <Input
                    id="city"
                    name={cityField.name}
                    onChange={cityField.onChange}
                    ref={cityField.ref}
                    disabled={isLoading}
                    error={!!errors.shipping?.city}
                    autoComplete="address-level2"
                  />
                </FormField>
              </div>

              <FormField
                label="Address"
                htmlFor="address"
                error={errors.shipping?.address?.message}
              >
                <Input
                  id="address"
                  name={addressField.name}
                  onChange={addressField.onChange}
                  ref={addressField.ref}
                  disabled={isLoading}
                  error={!!errors.shipping?.address}
                  autoComplete="street-address"
                />
              </FormField>
            </section>

            <section className="checkout-section">
              <h2>Payment</h2>

              <p className="checkout-hint">
                Test cards: 4242 4242 4242 4242 (success) · 4000 0000 0000 0002
                (declined)
              </p>

              {cardError && <p className="checkout-banner">{cardError}</p>}

              <FormField
                label="Card number"
                htmlFor="cardNumber"
                error={errors.card?.number?.message}
              >
                <Input
                  id="cardNumber"
                  name={numberField.name}
                  onChange={handleNumberChange}
                  ref={numberField.ref}
                  disabled={isLoading}
                  error={!!errors.card?.number}
                  placeholder="4242 4242 4242 4242"
                  autoComplete="cc-number"
                  inputMode="numeric"
                />
              </FormField>

              <FormField
                label="Name on card"
                htmlFor="cardHolder"
                error={errors.card?.holder?.message}
              >
                <Input
                  id="cardHolder"
                  name={holderField.name}
                  onChange={holderField.onChange}
                  ref={holderField.ref}
                  disabled={isLoading}
                  error={!!errors.card?.holder}
                  autoComplete="cc-name"
                />
              </FormField>

              <div className="checkout-row">
                <FormField
                  label="Expiry (MM/YY)"
                  htmlFor="cardExpiry"
                  error={errors.card?.expiry?.message}
                >
                  <Input
                    id="cardExpiry"
                    name={expiryField.name}
                    onChange={handleExpiryChange}
                    ref={expiryField.ref}
                    disabled={isLoading}
                    error={!!errors.card?.expiry}
                    placeholder="MM/YY"
                    autoComplete="cc-exp"
                    inputMode="numeric"
                  />
                </FormField>

                <FormField
                  label="CVC"
                  htmlFor="cardCvc"
                  error={errors.card?.cvc?.message}
                >
                  <Input
                    id="cardCvc"
                    type="password"
                    name={cvcField.name}
                    onChange={handleCvcChange}
                    ref={cvcField.ref}
                    disabled={isLoading}
                    error={!!errors.card?.cvc}
                    placeholder="123"
                    autoComplete="cc-csc"
                    inputMode="numeric"
                  />
                </FormField>
              </div>
            </section>

            {formError && (
              <p className="checkout-banner">
                {formError} <Link to="/cart">Go to cart</Link>
              </p>
            )}

            <Button type="submit" loading={isLoading}>
              Pay {data.total} {data.currency}
            </Button>
          </form>

          <aside className="checkout-summary">
            <h2>Order summary</h2>

            <ul className="checkout-summary__items">
              {data.items.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.product.title} × {item.qty}
                  </span>
                  <span>
                    {item.lineTotal} {data.currency}
                  </span>
                </li>
              ))}
            </ul>

            <div className="checkout-summary__row">
              <span>Subtotal</span>
              <span>
                {data.subtotal} {data.currency}
              </span>
            </div>

            <div className="checkout-summary__row">
              <span>Delivery</span>
              <span>
                {data.shippingFee === 0
                  ? "Free"
                  : `${data.shippingFee} ${data.currency}`}
              </span>
            </div>

            {data.shippingFee > 0 && missingForFreeShipping > 0 && (
              <p className="checkout-summary__hint">
                Add {Math.round(missingForFreeShipping * 100) / 100}{" "}
                {data.currency} more for free delivery
              </p>
            )}

            <div className="checkout-summary__row checkout-summary__total">
              <span>Total</span>
              <span>
                {data.total} {data.currency}
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
