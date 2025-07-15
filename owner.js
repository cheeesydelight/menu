// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDHyrO3YK0JI1wa6I1XQtcTh8asp2p992A",
  authDomain: "cheesydelight-80a43.firebaseapp.com",
  databaseURL: "https://cheesydelight-80a43-default-rtdb.firebaseio.com",
  projectId: "cheesydelight-80a43",
  storageBucket: "cheesydelight-80a43.appspot.com",
  messagingSenderId: "433558050592",
  appId: "1:433558050592:web:169b277e2337931475e945",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

window.currentPromo = null;

// 🔁 Watch promo updates from DB
db.ref("promo").on("value", (snap) => {
  window.currentPromo = snap.val();
});

const tableBody = document.getElementById("orders-table-body");
const totalSalesDiv = document.getElementById("total-sales");

// ✅ Format timestamp to readable date/time
function formatDate(ts) {
  if (!ts) return "-";
  const date = new Date(ts);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

// ✅ Render each order row
function renderOrder(orderId, order) {
  const row = document.createElement("tr");
  const items = order.items || [];
  const itemList = items
    .map((i) => `${i.name || "Item"} × ${i.qty || 1}`)
    .join(", ");

  let totalCell = `₹${order.total || 0}`;

  // ✅ Check if order had a promo when placed
  if (order.promo?.discount && order.total) {
    const discount = order.promo.discount;
    const discounted = Math.round(order.total * (1 - discount / 100));
    totalCell += `<br><small style="color:#ff5722;font-weight:bold;">🎉 ${discount}% OFF → ₹${discounted}</small>`;
  }

  row.innerHTML = `
    <td>${orderId}</td>
    <td>${order.name || "-"}</td>
    <td>${order.table || "-"}</td>
    <td><span class="status ${order.status || "unknown"}">${
    order.status || "-"
  }</span></td>
    <td>${itemList}</td>
    <td>${totalCell}</td>
    <td>${formatDate(order.timestamp)}</td>
  `;

  tableBody.appendChild(row);
}

// ✅ Load orders from Firebase
function loadOrders() {
  db.ref("orders").on("value", (snapshot) => {
    const orders = snapshot.val() || {};
    tableBody.innerHTML = "";
    let totalSales = 0;

    Object.entries(orders).forEach(([id, order]) => {
      renderOrder(id, order);

      if (order.status === "done") {
        let base = Number(order.total) || 0;
        if (order.promo?.discount) {
          base = Math.round(base * (1 - order.promo.discount / 100));
        }
        totalSales += base;
      }
    });

    totalSalesDiv.textContent = `Total Sales: ₹${totalSales}`;
  });
}

function downloadUserCSV() {
  db.ref("orders")
    .once("value")
    .then((snapshot) => {
      const orders = snapshot.val() || {};
      const rows = [
        ["Name", "Mobile", "Table", "Order ID", "Status", "Total", "Timestamp"],
      ];

      Object.entries(orders).forEach(([id, order]) => {
        rows.push([
          order.name || "",
          order.mobile || "", // optional if not present
          order.table || "",
          order.orderId || id,
          order.status || "",
          order.total || 0,
          new Date(order.timestamp).toLocaleString(),
        ]);
      });

      const csvContent = rows
        .map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cheeesy_Orders_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch((err) => {
      alert("⚠️ Failed to download order data.");
      console.error("CSV Download Error:", err);
    });
}

// 🚀 Start listening
loadOrders();
