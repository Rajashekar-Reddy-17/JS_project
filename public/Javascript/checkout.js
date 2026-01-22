function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function loadSummary() {
  let cart = getCart();

  let subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  let gst = Math.round(subtotal * 0.05);
  let total = subtotal + gst;

  document.getElementById("subtotal").innerText = subtotal;
  document.getElementById("gst").innerText = gst;
  document.getElementById("total").innerText = total;
}

loadSummary();
