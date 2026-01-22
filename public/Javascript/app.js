const API = "https://zen-fashion-hnjy.onrender.com";
let allProducts = [];



/* ================= REGISTER ================= */
function register() {
  fetch(`${API}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: regEmail.value,
      password: regPassword.value,
      role: "user"
    })
  }).then(() => alert("Registered Successfully"));
}

/* ================= LOGIN ================= */
function login() {
  fetch(`${API}/users`)
    .then(res => res.json())
    .then(users => {
      const user = users.find(
        u => u.email === loginEmail.value &&
             u.password === loginPassword.value
      );

      if (!user) {
        alert("Invalid credentials");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role || "user");

      if (user.role === "admin") {
        location.href = "admin.html";
      } else {
        location.href = "questionnaire.html";
      }
    });
}

/* ================= SAVE PREFERENCES ================= */
function savePreferences() {
  localStorage.setItem("style", style.value);
  localStorage.setItem("budget", budget.value);
  location.href = "dashboard.html";
}

/* ================= LOAD PRODUCTS ================= */
function loadProducts() {
  fetch("https://zen-fashion-hnjy.onrender.com/products")
    .then(res => res.json())
    .then(data => {
      const filtered = filterProducts(data);
      displayProducts(filtered);
    })
    .catch(err => console.error(err));
}


/* ================= APPLY FILTERS ================= */
function filterProducts(products) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.preferences) return products;

  const { style, budget } = user.preferences;

  return products.filter(product => {
    let budgetMatch = false;

    if (budget === "Low") {
      budgetMatch = product.price <= 1000;
    } else if (budget === "Medium") {
      budgetMatch = product.price > 1000 && product.price <= 2000;
    } else if (budget === "High") {
      budgetMatch = product.price > 2000;
    }

    return product.style === style && budgetMatch;
  });
}


/* ================= DISPLAY PRODUCTS ================= */
function displayProducts(data) {
  const container = document.getElementById("products");
  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = "<p>No products found</p>";
    return;
  }

  container.innerHTML = data.map(p => `
    <div class="card">
      <img src="${p.image}">
      <h4>${p.name}</h4>
      <p>${p.style}</p>
      <p>₹${p.price}</p>
      <button onclick='addToCart(${JSON.stringify(p)})'>
        Add to Cart
      </button>
    </div>
  `).join("");
}

/* ================= ADMIN PRODUCTS ================= */
if (document.getElementById("adminProducts")) {
  fetch(`${API}/products`)
    .then(res => res.json())
    .then(data => {
      adminProducts.innerHTML = data.map(p => `
        <div class="card">
          <img src="${p.image}">
          <h4>${p.name}</h4>
          <p>₹${p.price} | ${p.style}</p>
          <button onclick="deleteProduct(${p.id})">Delete</button>
        </div>
      `).join("");
    });
}

function addProduct() {
  fetch(`${API}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: pname.value,
      price: Number(pprice.value),
      style: pstyle.value,
      image: pimage.value
    })
  }).then(() => location.reload());
}

function deleteProduct(id) {
  fetch(`${API}/products/${id}`, { method: "DELETE" })
    .then(() => location.reload());
}

/* ================= CART CORE ================= */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function addToCart(product) {
  let cart = getCart();
  let existing = cart.find(i => i.id === product.id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert("Added to cart");
}

function updateCartCount() {
  let cart = getCart();
  let count = cart.reduce((s, i) => s + i.qty, 0);
  let el = document.getElementById("cartCount");
  if (el) el.innerText = count;
}

/* ================= CART PAGE ================= */
function loadCart() {
  let cart = getCart();
  let container = document.getElementById("cartItems");
  let total = 0;

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "<p>Cart is empty</p>";
    document.getElementById("cartTotal").innerText = 0;
    return;
  }

  container.innerHTML = cart.map((item, index) => {
    total += item.price * item.qty;

    return `
      <div class="card">
        <img src="${item.image}">
        <h3>${item.name}</h3>
        <p>₹${item.price} × ${item.qty}</p>
        <p><strong>₹${item.price * item.qty}</strong></p>

        <div class="qty-controls">
          <button onclick="decreaseQty(${index})">−</button>
          <span>${item.qty}</span>
          <button onclick="increaseQty(${index})">+</button>
        </div>

        <button class="remove-btn" onclick="removeFromCart(${index})">
          Remove
        </button>
      </div>
    `;
  }).join("");

  document.getElementById("cartTotal").innerText = total;
}


function increaseQty(index) {
  let cart = getCart();
  cart[index].qty++;
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

function decreaseQty(index) {
  let cart = getCart();
  if (cart[index].qty > 1) cart[index].qty--;
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

function removeFromCart(index) {
  let cart = getCart();
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

/* ================= CHECKOUT ================= */
function placeOrder() {
  let cart = getCart();

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  let user = JSON.parse(localStorage.getItem("user"));

  let total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  let order = {
    id: "order_" + Date.now(),
    userEmail: user.email,
    items: cart,
    total: total,
    date: new Date().toLocaleString()
  };

  fetch("https://zen-fashion-hnjy.onrender.com/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  }).then(() => {
    localStorage.removeItem("cart");

    // 🔥 SHOW THANK YOU MESSAGE
    document.getElementById("summaryBox").style.display = "none";
    document.querySelector("button").style.display = "none";
    document.getElementById("thankYouBox").style.display = "block";

    // ⏳ OPTIONAL REDIRECT AFTER 3 SECONDS
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 3000);
  });
}



/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  location.href = "auth.html";
}

/* ================= INIT ================= */
updateCartCount();
loadProducts();
loadCart();

function savePreferences() {
  const style = document.getElementById("styleSelect").value;
  const budget = document.getElementById("budgetSelect").value;

  if (!style || !budget) {
    alert("Please select both style and budget");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  user.preferences = { style, budget };

  localStorage.setItem("user", JSON.stringify(user));

 // alert("Preferences saved successfully!");
  window.location.href = "dashboard.html";
}
function goToCheckout() {
  let cart = getCart();

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  window.location.href = "checkout.html";
}
