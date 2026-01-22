// 🔐 Admin access check
const role = localStorage.getItem("role");

if (role !== "admin") {
  alert("Access Denied! Admin only.");
  window.location.href = "login.html";
}

// ✅ Run only AFTER page loads
document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
});

const API_URL = "https://zen-fashion-hnjy.onrender.com/orders";

function loadOrders() {
  fetch(API_URL)
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      return res.json();
    })
    .then(data => {
      console.log("Orders fetched:", data); // 🔍 DEBUG

      if (!data || data.length === 0) {
        document.getElementById("ordersContainer").innerHTML =
          "<p>No orders found</p>";
        return;
      }

      renderOrders(data);
    })
    .catch(err => {
      console.error(err);
      document.getElementById("ordersContainer").innerHTML =
        "<p style='color:red'>Error loading orders</p>";
    });
}

function renderOrders(orders) {
  const container = document.getElementById("ordersContainer");

  container.innerHTML = orders.map(order => `
    <div class="order-card">
      <h3>Order ID: ${order.id}</h3>
      <p><strong>User:</strong> ${order.userEmail}</p>
      <p><strong>Date:</strong> ${order.date}</p>

      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <img src="${item.image}" alt="${item.name}">
            <div>
              <p>${item.name}</p>
              <p>₹${item.price} × ${item.qty}</p>
              <p><strong>₹${item.price * item.qty}</strong></p>
            </div>
          </div>
        `).join("")}
      </div>

      <h4>Total: ₹${order.total}</h4>
    </div>
  `).join("");
}
