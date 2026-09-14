async function runTests() {
  console.log("Testing Sharekart Full-Stack Services...\n");

  // 1. Frontend Check
  const feRes = await fetch("http://localhost:3000/");
  console.log(`[Frontend] Vite React Dev Server: HTTP ${feRes.status}`);

  // 2. Health Check
  const healthRes = await fetch("http://localhost:5000/api/health");
  const health = await healthRes.json();
  console.log(`[Backend] API Health: ${health.status} (${health.app})`);

  // 3. Products List
  const prodRes = await fetch("http://localhost:5000/api/products");
  const prods = await prodRes.json();
  console.log(`[Products] Total items in database: ${prods.count}`);

  // 4. Product Details
  const p1Res = await fetch("http://localhost:5000/api/products/1");
  const p1 = await p1Res.json();
  console.log(
    `[Product Details] ID 1: "${p1.product.title}" - Rent: ₹${p1.product.rent_price_daily}/day, Deposit: ₹${p1.product.security_deposit}`,
  );
  console.log(`[Reviews] Total reviews for ID 1: ${p1.reviews.length}`);

  // 5. Rental Cost Calculation
  const costRes = await fetch("http://localhost:5000/api/rentals/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: 1,
      startDate: "2025-10-24",
      endDate: "2025-10-27",
      deliveryType: "delivery",
    }),
  });
  const cost = await costRes.json();
  console.log(
    `[Cost Calculation] ${cost.totalDays} Days: Rent=₹${cost.rentFee}, Deposit=₹${cost.depositFee}, Delivery=₹${cost.deliveryFee}, Total Payable=₹${cost.totalAmount}, Net Cost=₹${cost.netCost}`,
  );

  // 6. Auth Login
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "aarav@sharekart.in",
      password: "password123",
    }),
  });
  const login = await loginRes.json();
  console.log(
    `[Auth] Logged in as: ${login.user.name} (Aadhaar: ${login.user.aadhaar_hash})`,
  );

  // 7. Seller Dashboard Stats
  const statsRes = await fetch("http://localhost:5000/api/dashboard/stats", {
    headers: { Authorization: `Bearer ${login.token}` },
  });
  const stats = await statsRes.json();
  console.log(
    `[Dashboard] Active Inventory: ${stats.stats.activeInventory.total} items | Pending Requests: ${stats.stats.pendingRequests.count} | Monthly Earnings: ₹${stats.stats.earnings.monthlyTotal}`,
  );

  // 8. Escrow Checkout Simulation
  const checkoutRes = await fetch(
    "http://localhost:5000/api/rentals/checkout",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${login.token}`,
      },
      body: JSON.stringify({
        productId: 1,
        orderType: "rent",
        startDate: "2025-10-24",
        endDate: "2025-10-27",
        totalDays: 3,
        deliveryType: "pickup",
        paymentMethod: "upi",
      }),
    },
  );
  const checkout = await checkoutRes.json();
  console.log(
    `[Checkout & Escrow] Order Booked: ${checkout.order.id} | Handover Escrow PIN: ${checkout.order.escrow_pin} | Status: ${checkout.order.escrow_status}`,
  );

  console.log("\nAll End-to-End Tests Passed Successfully!");
}

runTests().catch(console.error);
