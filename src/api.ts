export const API = "https://shop-api-kbe6.onrender.com/api";
export async function forgotPassword(email: string) {
  const response = await fetch(`${API}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}
export async function verifyResetCode(email: string, code: string) {
  const response = await fetch(`${API}/auth/verify-reset-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      code: code,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}
export async function resetPassword(resetToken: string, password: string) {
  const response = await fetch(`${API}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resetToken: resetToken,
      password: password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}
export async function register(name: string, email: string, password: string) {
  const response = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      email: email,
      password: password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}
export async function login(email: string, password: string) {
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}
////////////////////// 3 page magla forgot/login/register fetchebi
////////////////////////
////////////////////
/////////////
//////////////////////////////////// categories
export const Category = "laptops";
export async function getCategory() {
  const response = await fetch(`${API}/categories/${Category}`);

  const data = await response.json();

  if (!response.ok) throw data;

  return data;
}
// export async function getProducts(searchParams: URLSearchParams) {
//   const params = new URLSearchParams(searchParams);

//   params.set("category", Category);

//   if (!params.has("page")) {
//     params.set("page", "1");
//   }

//   if (!params.has("limit")) {
//     params.set("limit", "12");
//   }

//   // const response = await fetch(`${API}/api/products?/category=${Category}`);
//   // api agar unda
//   const response = await fetch(`${API}/products?${params.toString()}`);
//   // ? queris win iwereba

//   const data = await response.json();

//   if (!response.ok) throw data;

//   return data;
// }
// mtavadmai9djiadiadiadiawkdiajdiajdaijdi9ajdai9jd9ajd89ajd89ajda89dja89jda89dja89dja89dja89dja89dj
// adaodkadka0dkada

// mtavadmai9djiadiad

// mtavadmai9djiadiad

// mtavadmai9djiadiad

// mtavadmai9djiadiad
export async function getProducts(searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams);

  params.set("category", Category);

  if (!params.has("page")) {
    params.set("page", "1");
  }

  if (!params.has("limit")) {
    params.set("limit", "12");
  }

  const url = `${API}/products?${params.toString()}`;

  console.log("PRODUCTS URL:", url);

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) throw data;

  return data;
}
// ///////////////////////////////////////////
////////////////////////////////
//////////////////////////
// log in an guest  tokenis mixedvit
export async function getMe(token: string) {
  const response = await fetch(`${API}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) throw data;

  return data;
}
///////////////////////////////////
// product page
export async function getProduct(slug: string) {
  const response = await fetch(`${API}/products/${slug}`);

  const data = await response.json();

  if (!response.ok) throw data;

  return data;
}
// every cart request needs the token, so it is added in one place
async function cartRequest(path: string, method: string, body?: object) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API}${path}`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) throw data;

  return data;
}

export function getCart() {
  return cartRequest("/cart", "GET");
}

export function addCartItem(productId: string, qty: number) {
  return cartRequest("/cart/items", "POST", { productId: productId, qty: qty });
}

export function updateCartItem(itemId: string, qty: number) {
  return cartRequest(`/cart/items/${itemId}`, "PATCH", { qty: qty });
}

export function removeCartItem(itemId: string) {
  return cartRequest(`/cart/items/${itemId}`, "DELETE");
}
export function getCheckout() {
  return cartRequest("/checkout", "GET");
}
export function createOrder(body: object) {
  return cartRequest("/orders", "POST", body);
}

export function confirmOrder(orderId: string, code: string) {
  return cartRequest(`/orders/${orderId}/confirm`, "POST", { code: code });
}

export function resendOrderCode(orderId: string) {
  return cartRequest(`/orders/${orderId}/resend-code`, "POST");
}

export function getOrder(orderId: string) {
  return cartRequest(`/orders/${orderId}`, "GET");
}
export function updateProfile(body: object) {
  return cartRequest("/auth/me", "PATCH", body);
}
