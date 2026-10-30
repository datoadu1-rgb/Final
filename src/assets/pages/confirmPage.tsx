import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { confirmOrder, resendOrderCode } from "../../api";
import { useAuth } from "../../auth";
import { useCart } from "./cart";
import { AuthButton, Button, FormField, Input } from "../../shared-components";
import "../catalog.css";

function ConfirmPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const cart = useCart();

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [banner, setBanner] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  function goToLogin() {
    auth.logout();
    navigate("/login?redirect=/checkout/confirm/" + orderId);
  }

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCodeError("");
    setBanner("");
    setInfo("");

    if (!/^\d{6}$/.test(code)) {
      setCodeError("Enter the 6-digit code");
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmOrder(orderId ?? "", code);

      await cart.reloadCart();

      navigate("/orders/" + orderId, { replace: true });
    } catch (error) {
      const apiError = error as { code?: string };

      if (apiError.code === "INVALID_PAYMENT_CODE") {
        setCodeError("The code is wrong or has expired");
      } else if (apiError.code === "TOO_MANY_ATTEMPTS") {
        setBanner("Too many attempts. Please request a new code.");
      } else if (apiError.code === "ORDER_ALREADY_PAID") {
        navigate("/orders/" + orderId, { replace: true });
      } else if (apiError.code === "INSUFFICIENT_STOCK") {
        setBanner("The last item was bought by someone else. Check your cart.");
      } else if (
        apiError.code === "UNAUTHORIZED" ||
        apiError.code === "TOKEN_EXPIRED"
      ) {
        goToLogin();
      } else {
        setBanner("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setCodeError("");
    setBanner("");
    setInfo("");

    try {
      await resendOrderCode(orderId ?? "");
      setSecondsLeft(30);
      setInfo("A new code has been sent");
    } catch (error) {
      const apiError = error as { code?: string; retryAfterSeconds?: number };

      if (apiError.code === "RESEND_TOO_SOON") {
        setSecondsLeft(apiError.retryAfterSeconds ?? 30);
      } else if (apiError.code === "ORDER_ALREADY_PAID") {
        navigate("/orders/" + orderId, { replace: true });
      } else if (
        apiError.code === "UNAUTHORIZED" ||
        apiError.code === "TOKEN_EXPIRED"
      ) {
        goToLogin();
      } else {
        setBanner("Could not send a new code. Please try again.");
      }
    }
  }

  return (
    <div className="catalog-page product-page checkout-page">
      <div className="product-container">
        <div className="product-topbar">
          <Link className="product-back" to="/checkout">
            ← Back to checkout
          </Link>
          <AuthButton />
        </div>

        <div className="confirm-box">
          <h1>Confirm payment</h1>

          <p>
            We sent a code to {auth.user?.email}. It is valid for 10 minutes.
          </p>

          <p className="checkout-hint">
            Test mode: the code is in DevTools → Network → the response of the
            orders request (devCode).
          </p>

          <form
            className="checkout-section"
            onSubmit={handleConfirm}
            noValidate
          >
            <FormField label="Code" htmlFor="code" error={codeError}>
              <Input
                id="code"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                disabled={isSubmitting}
                error={!!codeError}
                placeholder="123456"
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            </FormField>

            {banner && <p className="checkout-banner">{banner}</p>}
            {info && (
              <p className="cart-message cart-message--success">{info}</p>
            )}

            <Button type="submit" loading={isSubmitting}>
              Confirm
            </Button>

            <button
              type="button"
              className="resend-button"
              disabled={secondsLeft > 0 || isSubmitting}
              onClick={handleResend}
            >
              {secondsLeft > 0
                ? `Resend code in ${secondsLeft}s`
                : "Resend code"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ConfirmPage;
