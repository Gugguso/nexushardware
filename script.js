const products = window.nexusProducts;
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const grid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const emptyState = document.querySelector("#empty-state");
const cart = window.nexusCart.read();
const favorites = window.nexusFavorites.read();
products.filter((product) => product.unavailable).forEach((product) => cart.delete(product.id));
window.nexusCart.save(cart);
const accountGreeting = document.querySelector("#account-greeting");
let activeCategory = "Todos";
let searchTerm = "";
let toastTimer;

try {
  if (sessionStorage.getItem("nexus-demo-authenticated") === "true") {
    const savedAccount = JSON.parse(sessionStorage.getItem("nexus-demo-account"));
    if (savedAccount && typeof savedAccount.name === "string" && savedAccount.name.trim()) {
      document.querySelector("#account-greeting-text").textContent = `Olá, ${savedAccount.name.trim()}`;
      accountGreeting.hidden = false;
    }
  }
} catch (error) {
  console.error("Não foi possível carregar a saudação da conta demonstrativa.", error);
}

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function getSearchDestination(query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return null;

  const helpIntent =
    /\b(ajuda|help|suporte|atendimento|contato|pedido|pedidos|troca|garantia|devolucao|reembolso|rastreio|rastrear|entrega|cancelamento|reclamacao)\b/.test(
      normalizedQuery,
    );
  if (helpIntent) return "atendimento.html";

  const accountIntent =
    /\b(login|entrar|conta|senha|cadastro|cadastrar|registrar)\b/.test(
      normalizedQuery,
    );
  if (accountIntent) return "login.html";

  return null;
}

function renderProductVisual(product, className) {
  if (product.image) {
    return `<img class="product-photo" src="${product.image}" alt="${product.name}">`;
  }
  const visual = product.icon ? window.nexusHardwareIcons[product.icon] : product.emoji;
  return `<span class="${className}" aria-hidden="true">${visual}</span>`;
}

function renderProducts() {
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    const searchableText = normalizeText(
      `${product.name} ${product.category} ${product.searchTerms}`,
    );
    const matchesSearch = searchableText.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  grid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        <button
          class="wishlist${favorites.has(product.id) ? " selected" : ""}"
          type="button"
          aria-label="${favorites.has(product.id) ? `Remover ${product.name} dos favoritos` : `Adicionar ${product.name} aos favoritos`}"
          aria-pressed="${favorites.has(product.id)}"
        >${favorites.has(product.id) ? "♥" : "♡"}</button>
        <a class="product-visual-link" href="produto.html?id=${product.id}" aria-label="Ver detalhes de ${product.name}">
          ${renderProductVisual(product, `product-emoji${product.icon ? " product-icon" : ""}`)}
        </a>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title"><a href="produto.html?id=${product.id}">${product.name}</a></h3>
        <div class="product-rating" aria-label="Avaliação ${product.rating} de 5">
          <span class="rating-stars" style="--rating: ${Number(product.rating) * 20}%">★★★★★</span>
          <small>${product.rating} (${product.reviews})</small>
        </div>
        <div class="price-row">
          <div class="product-price${product.priceLabel ? " special-price" : ""}">
            ${product.priceLabel || currency.format(product.price)}
            ${product.priceLabel ? "" : `<small>ou 10x de ${currency.format(product.price / 10)} sem juros</small>`}
          </div>
          ${product.unavailable ? "" : `
            <button
              class="add-cart"
              type="button"
              data-add="${product.id}"
              aria-label="Adicionar ${product.name} ao carrinho"
            >+</button>
          `}
        </div>
      </div>
    </article>
  `).join("");

  emptyState.hidden = visibleProducts.length > 0 || !searchTerm;
}

function renderCart() {
  const items = [...cart.entries()];
  const itemCount = items.reduce((total, [, quantity]) => total + quantity, 0);
  const total = items.reduce((sum, [id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return sum + product.price * quantity;
  }, 0);

  document.querySelector("#cart-count").textContent = itemCount;
  document.querySelector("#favorites-count").textContent = favorites.size;
  document.querySelector("#cart-total").textContent = currency.format(total);
  document.querySelector("#cart-items").innerHTML = items.length
    ? items.map(([id, quantity]) => {
      const product = products.find((item) => item.id === id);
      return `<article class="cart-item">
        ${renderProductVisual(product, "cart-item-emoji")}
        <div>
          <h3>${product.name}</h3>
          <p>${currency.format(product.price)}</p>
          <div class="quantity" aria-label="Quantidade">
            <button
              type="button"
              data-quantity="${id}"
              data-change="-1"
              aria-label="Diminuir quantidade"
            >−</button>
            <span>${quantity}</span>
            <button
              type="button"
              data-quantity="${id}"
              data-change="1"
              aria-label="Aumentar quantidade"
            >+</button>
          </div>
        </div>
        <button
          class="remove-item"
          type="button"
          data-remove="${id}"
          aria-label="Remover ${product.name}"
        >×</button>
      </article>`;
    }).join("")
    : '<div class="empty-cart"><span aria-hidden="true">▢</span>Seu carrinho ainda está vazio.<br>Que tal encontrar seu próximo upgrade?</div>';
}

function showToast(message, duration = 2200, prominent = false) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  toast.classList.toggle("toast-prominent", prominent);
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show", "toast-prominent");
  }, duration);
}

function setCategory(category) {
  activeCategory = category;
  document.querySelectorAll(".filter-chip").forEach((button) => {
    const isActive = button.dataset.category === category;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  document.querySelectorAll(".category-nav a").forEach((link) => {
    link.classList.toggle("active", link.dataset.navCategory === category);
  });
  renderProducts();
}

function setCartOpen(isOpen) {
  const drawer = document.querySelector("#cart-drawer");
  const overlay = document.querySelector("#cart-overlay");
  drawer.classList.toggle("open", isOpen);
  drawer.setAttribute("aria-hidden", String(!isOpen));
  overlay.hidden = !isOpen;
  document.body.classList.toggle("cart-open", isOpen);
  if (isOpen) document.querySelector("#close-cart").focus();
}

document.querySelector(".search").addEventListener("submit", (event) => {
  event.preventDefault();
  const destination = getSearchDestination(searchInput.value);
  if (destination) {
    window.location.href = destination;
    return;
  }

  searchTerm = normalizeText(searchInput.value);
  renderProducts();
  document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
});

searchInput.addEventListener("input", () => {
  searchTerm = normalizeText(searchInput.value);
  renderProducts();
});

document.querySelectorAll(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => setCategory(button.dataset.category));
});

document.querySelectorAll(".category-nav a").forEach((link) => {
  link.addEventListener("click", () => setCategory(link.dataset.navCategory));
});

grid.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const addButton = target.closest("[data-add]");
  if (addButton) {
    const id = Number(addButton.dataset.add);
    cart.set(id, (cart.get(id) || 0) + 1);
    window.nexusCart.save(cart);
    renderCart();
    showToast("Produto adicionado ao carrinho!");
    return;
  }

  const favoriteButton = target.closest(".wishlist");
  if (favoriteButton) {
    const productCard = favoriteButton.closest(".product-card");
    const productId = Number(productCard.dataset.productId);
    const product = products.find((item) => item.id === productId);
    const isSelected = favoriteButton.getAttribute("aria-pressed") !== "true";
    if (isSelected) favorites.add(productId);
    else favorites.delete(productId);
    window.nexusFavorites.save(favorites);
    favoriteButton.setAttribute("aria-pressed", String(isSelected));
    favoriteButton.setAttribute(
      "aria-label",
      `${isSelected ? "Remover" : "Adicionar"} ${product.name} dos favoritos`,
    );
    favoriteButton.classList.toggle("selected", isSelected);
    favoriteButton.textContent = isSelected ? "♥" : "♡";
    showToast(isSelected ? "Adicionado aos favoritos!" : "Removido dos favoritos.");
    return;
  }

  if (target.closest("a, button")) return;
  const productCard = target.closest(".product-card");
  if (productCard) window.location.href = `produto.html?id=${productCard.dataset.productId}`;
});

document.querySelector("#cart-items").addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const quantityButton = target.closest("[data-quantity]");
  if (quantityButton) {
    const id = Number(quantityButton.dataset.quantity);
    const nextQuantity = (cart.get(id) || 0) + Number(quantityButton.dataset.change);
    if (nextQuantity > 0) {
      cart.set(id, nextQuantity);
    } else {
      cart.delete(id);
    }
    window.nexusCart.save(cart);
    renderCart();
    return;
  }

  const removeButton = target.closest("[data-remove]");
  if (removeButton) {
    cart.delete(Number(removeButton.dataset.remove));
    window.nexusCart.save(cart);
    renderCart();
  }
});

document.querySelector("#open-cart").addEventListener("click", () => setCartOpen(true));
document.querySelector("#close-cart").addEventListener("click", () => setCartOpen(false));
document.querySelector("#cart-overlay").addEventListener("click", () => setCartOpen(false));
document.querySelector("#checkout-button").addEventListener("click", () => {
  if (cart.size === 0) {
    showToast("Seu carrinho está vazio.");
    return;
  }
  showToast("Checkout demonstrativo — seus produtos estão reservados no carrinho.");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.querySelector("#cart-drawer").classList.contains("open")) {
    setCartOpen(false);
    document.querySelector("#open-cart").focus();
  }
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
if (new URLSearchParams(window.location.search).get("cart") === "1") setCartOpen(true);
