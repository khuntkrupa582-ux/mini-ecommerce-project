
const products = [
  {
    id: 1,
    name: "Notebook",
    price: 120,
    category: "Stationery",
    icon: "📓",
    description: "A notebook for your daily ideas."
  },
  {
    id: 2,
    name: "Pen Pack",
    price: 80,
    category: "Stationery",
    icon: "🖊️",
    description: "Smooth-writing pens for everyday use."
  },
  {
    id: 3,
    name: "Desk Lamp",
    price: 650,
    category: "Home",
    icon: "💡",
    description: "A stylish lamp for your workspace."
  },
  {
    id: 4,
    name: "Coffee Mug",
    price: 250,
    category: "Kitchen",
    icon: "☕",
    description: "Your favourite drink, your favourite mug."
  },
  {
    id: 5,
    name: "Backpack",
    price: 899,
    category: "Accessories",
    icon: "🎒",
    description: "A handy bag for work or study."
  },
  {
    id: 6,
    name: "Headphones",
    price: 1299,
    category: "Electronics",
    icon: "🎧",
    description: "Enjoy your music wherever you go."
  },
  {
    id: 7,
    name: "Water Bottle",
    price: 350,
    category: "Lifestyle",
    icon: "🧴",
    description: "A reusable bottle for everyday hydration."
  },
  {
    id: 8,
    name: "Wrist Watch",
    price: 1599,
    category: "Accessories",
    icon: "⌚",
    description: "A simple watch for your daily routine."
  }
];

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const subtotalElement = document.getElementById("subtotal");
const deliveryElement = document.getElementById("delivery");
const totalElement = document.getElementById("total");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutDialog = document.getElementById("checkoutDialog");
const orderSummary = document.getElementById("orderSummary");
const dialogTotal = document.getElementById("dialogTotal");
const closeDialog = document.getElementById("closeDialog");

const money = amount =>
  amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  });

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("miniShopCart") || "{}");

    if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
      return {};
    }

    const cleanCart = {};

    for (const [id, quantity] of Object.entries(saved)) {
      const productExists = products.some(
        product => product.id === Number(id)
      );

      if (
        productExists &&
        Number.isInteger(quantity) &&
        quantity > 0
      ) {
        cleanCart[id] = quantity;
      }
    }

    return cleanCart;
  } catch {
    return {};
  }
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem("miniShopCart", JSON.stringify(cart));
  } catch {
    alert("Cart could not be saved in this browser.");
  }

  renderCart();
}

function renderProducts() {
  productGrid.replaceChildren();

  products.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const art = document.createElement("div");
    art.className = "product-art";
    art.setAttribute("aria-hidden", "true");
    art.textContent = product.icon;

    const info = document.createElement("div");
    info.className = "product-info";

    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = product.category;

    const name = document.createElement("h3");
    name.textContent = product.name;

    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description;

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = money(product.price);

    const button = document.createElement("button");
    button.className = "add-btn";
    button.textContent = "Add to Cart";
    button.type = "button";
    button.dataset.productId = product.id;

    bottom.append(price, button);
    info.append(category, name, description, bottom);
    card.append(art, info);
    productGrid.append(card);
  });
}

function addToCart(id) {
  const product = products.find(item => item.id === Number(id));

  if (!product) return;

  cart[id] = (cart[id] || 0) + 1;
  saveCart();
}

function changeQuantity(id, delta) {
  if (!cart[id]) return;

  cart[id] += delta;

  if (cart[id] <= 0) {
    delete cart[id];
  }

  saveCart();
}

function removeItem(id) {
  delete cart[id];
  saveCart();
}

function calculateTotals() {
  const subtotal = Object.entries(cart).reduce(
    (sum, [id, quantity]) => {
      const product = products.find(
        item => item.id === Number(id)
      );

      return product ? sum + product.price * quantity : sum;
    },
    0
  );

  const delivery = subtotal > 0 && subtotal < 500 ? 40 : 0;

  return {
    subtotal,
    delivery,
    total: subtotal + delivery
  };
}

function renderCart() {
  cartItems.replaceChildren();

  const itemCount = Object.values(cart).reduce(
    (sum, quantity) => sum + quantity,
    0
  );

  cartCount.textContent = itemCount;

  const entries = Object.entries(cart).filter(
    ([id, quantity]) =>
      quantity > 0 &&
      products.some(product => product.id === Number(id))
  );

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-cart";
    empty.textContent = "Your cart is empty. Add a product to get started!";
    cartItems.append(empty);
  } else {
    const wrapper = document.createElement("div");
    wrapper.className = "cart-table-wrap";

    const table = document.createElement("table");
    table.className = "cart-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["Product", "Price", "Quantity", "Line Total", "Action"].forEach(
      label => {
        const th = document.createElement("th");
        th.textContent = label;
        headerRow.append(th);
      }
    );

    thead.append(headerRow);

    const tbody = document.createElement("tbody");

    entries.forEach(([id, quantity]) => {
      const product = products.find(
        item => item.id === Number(id)
      );

      if (!product) return;

      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.textContent = `${product.icon} ${product.name}`;

      const priceCell = document.createElement("td");
      priceCell.textContent = money(product.price);

      const quantityCell = document.createElement("td");
      const controls = document.createElement("div");
      controls.className = "quantity-controls";

      const minus = document.createElement("button");
      minus.className = "quantity-btn";
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", `Decrease ${product.name}`);
      minus.dataset.action = "decrease";
      minus.dataset.productId = id;

      const quantityText = document.createElement("span");
      quantityText.textContent = quantity;

      const plus = document.createElement("button");
      plus.className = "quantity-btn";
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", `Increase ${product.name}`);
      plus.dataset.action = "increase";
      plus.dataset.productId = id;

      controls.append(minus, quantityText, plus);
      quantityCell.append(controls);

      const lineTotalCell = document.createElement("td");
      lineTotalCell.textContent = money(product.price * quantity);

      const actionCell = document.createElement("td");
      const remove = document.createElement("button");
      remove.className = "remove-btn";
      remove.type = "button";
      remove.textContent = "Remove";
      remove.dataset.action = "remove";
      remove.dataset.productId = id;
      remove.setAttribute("aria-label", `Remove ${product.name}`);

      actionCell.append(remove);

      row.append(
        nameCell,
        priceCell,
        quantityCell,
        lineTotalCell,
        actionCell
      );

      tbody.append(row);
    });

    table.append(thead, tbody);
    wrapper.append(table);
    cartItems.append(wrapper);
  }

  const totals = calculateTotals();

  subtotalElement.textContent = money(totals.subtotal);
  deliveryElement.textContent = money(totals.delivery);
  totalElement.textContent = money(totals.total);
  checkoutBtn.disabled = itemCount === 0;
}

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-product-id]");

  if (button) {
    addToCart(button.dataset.productId);
  }
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");

  if (!button) return;

  const id = button.dataset.productId;
  const action = button.dataset.action;

  if (action === "increase") {
    changeQuantity(id, 1);
  } else if (action === "decrease") {
    changeQuantity(id, -1);
  } else if (action === "remove") {
    removeItem(id);
  }
});

checkoutBtn.addEventListener("click", () => {
  const entries = Object.entries(cart).filter(
    ([id, quantity]) =>
      quantity > 0 &&
      products.some(product => product.id === Number(id))
  );

  if (entries.length === 0) return;

  orderSummary.replaceChildren();

  entries.forEach(([id, quantity]) => {
    const product = products.find(
      item => item.id === Number(id)
    );

    if (!product) return;

    const line = document.createElement("p");
    line.className = "order-line";

    const name = document.createElement("span");
    name.textContent = `${product.name} × ${quantity}`;

    const price = document.createElement("strong");
    price.textContent = money(product.price * quantity);

    line.append(name, price);
    orderSummary.append(line);
  });

  dialogTotal.textContent = money(calculateTotals().total);
  checkoutDialog.showModal();
});

closeDialog.addEventListener("click", () => {
  checkoutDialog.close();
});

checkoutDialog.addEventListener("click", event => {
  if (event.target === checkoutDialog) {
    checkoutDialog.close();
  }
});

renderProducts();
renderCart();
