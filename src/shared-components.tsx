/* eslint-disable react-hooks/refs */
// src/shared-components.tsx
import { useState } from "react";
import "./assets/shared.css";
// import robot from "../public/robot.mp4";
import { Link } from "react-router-dom";
import { useAuth } from "./auth";
import type { ChangeEvent, ReactNode, Ref } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./assets/pages/cart.tsx";
/////////////////////////////////////////////////////////////////////////
interface ButtonProps {
  type?: "button" | "submit";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function Button(props: ButtonProps) {
  return (
    <button
      className="button"
      type={props.type || "button"}
      disabled={props.disabled || props.loading}
      onClick={props.onClick}
    >
      {props.loading ? "Loading..." : props.children}
    </button>
  );
}

/////////////////////////////////////////////////////////////////////////
interface InputProps {
  id: string;
  name?: string;
  type?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  ref?: Ref<HTMLInputElement>;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text";
}

export function Input(props: InputProps) {
  return (
    <input
      id={props.id}
      name={props.name}
      className={props.error ? "input input--error" : "input"}
      type={props.type || "text"}
      value={props.value}
      onChange={props.onChange}
      ref={props.ref}
      disabled={props.disabled}
      placeholder={props.placeholder}
      autoComplete={props.autoComplete}
      inputMode={props.inputMode}
    />
  );
}

interface PasswordInputProps {
  id: string;
  name?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  // mshoblidan modis propad instrukcia
  ref?: Ref<HTMLInputElement>;
  disabled?: boolean;
  error?: boolean;
}

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div className="password-input">
      <Input
        id={props.id}
        name={props.name}
        type={visible ? "text" : "password"}
        value={props.value}
        onChange={props.onChange}
        ref={props.ref}
        disabled={props.disabled}
        error={props.error}
      />
      <button
        type="button"
        className="password-input__toggle"
        onClick={function () {
          setVisible(!visible);
        }}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}

/////////////////////////////////////////////////////////////////////////
interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

export function FormField(props: FormFieldProps) {
  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={props.htmlFor}>
        {props.label}
      </label>
      {props.children}
      {props.error && <p className="form-field__error">{props.error}</p>}
    </div>
  );
}

/////////////////////////////////////////////////////////////////////////
type AlertType = "error" | "success";

interface AlertProps {
  type?: AlertType;
  children: ReactNode;
}

export function Alert(props: AlertProps) {
  return (
    <div className={"alert alert--" + (props.type || "error")}>
      {props.children}
    </div>
  );
}
////////////////////////// done for css
interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout(props: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__image">
        {" "}
        <img
          src="/andras-vas-Bd7gNnWJBkU-unsplash.jpg"
          alt="laptop"
          loading="lazy"
        />
      </div>
      <div className="auth-layout__panel">{props.children}</div>
      <Link className="auth-layout__title" to="/catalog">
        TECH<sup>2</sup>HEADS
      </Link>
      {/* ukan catalogshi */}
    </div>
  );
}

//  logoutis
export function AuthButton() {
  const auth = useAuth();
  const cart = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    auth.logout();
    cart.clearCart();
    navigate("/login");
  }

  if (auth.status === "loading") {
    return null;
  }

  if (auth.status === "guest") {
    return (
      <Link className="auth-button" to="/login">
        Log in
      </Link>
    );
  }

  return (
    <button type="button" className="auth-button" onClick={handleLogout}>
      Log out
    </button>
  );
}

//  floating cart thina  below the screen
export function FloatingCart() {
  const auth = useAuth();
  const cart = useCart();

  const count = cart.cart?.totalQty ?? 0;

  // hidden until the cart has something in it
  if (auth.status !== "authenticated" || count === 0) {
    return null;
  }

  return (
    <Link className="floating-cart" to="/cart" aria-label="Open cart">
      {/* the key changes with the count, so React rebuilds this and the animation plays again */}
      <span key={count} className="floating-cart__inner">
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>

        <span className="floating-cart__badge">{count}</span>
      </span>
    </Link>
  );
}
