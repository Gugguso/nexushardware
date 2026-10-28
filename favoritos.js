const favoriteProducts = window.nexusProducts;
const favoriteGrid = document.querySelector("#favorites-grid");
const emptyFavorites = document.querySelector("#favorites-empty");
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const favorites = window.nexusFavorites.read();
const cart = window.nexusCart.read();
let toastTimer;

function showFavoritesToast(message) {
  const toast = document.querySelector("#favorites-toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderFavorites() {
  const savedProducts = favoriteProducts.filter((product) => favorites.has(product.id));
  document.querySelector("#favorites-count").textContent = savedProducts.length;
  document.querySelector("#favorites-cart-count").textContent = [
    ...cart.values(),
  ].reduce((total, quantity) => total + quantity, 0);
  emptyFavorites.hidden = savedProducts.length > 0;
  favoriteGrid.innerHTML = savedProducts
    .map(
      (product) => `
        <article class="favorite-card" data-product-id="${product.id}">
          <div class="favorite-visual">
            <a href="produto.html?id=${product.id}" aria-label="Ver ${product.name}">
              ${
                product.image
                  ? `<img src="${product.image}" alt="${product.name}">`
                  : product.icon
                  ? `<span class="favorite-visual-icon" aria-hidden="true">${window.nexusHardwareIcons[product.icon]}</span>`
                  : `<span class="favorite-visual-emoji" aria-hidden="true">${product.emoji}</span>`
              }
            </a>
            <button
              class="favorite-remove"
              type="button"
              data-remove-favorite="${product.id}"
              aria-label="Remover ${product.name} dos favoritos"
            >♥</button>
          </div>
          <div class="favorite-info">
            <span class="favorite-category">${product.category}</span>
            <h2 class="favorite-title">
              <a href="produto.html?id=${product.id}">${product.name}</a>
            </h2>
            <p class="favorite-description">${product.description}</p>
            <div class="favorite-buy-row">
              <strong class="favorite-price">
                ${currency.format(product.price)}
                <small>ou 10x de ${currency.format(product.price / 10)} sem juros</small>
              </strong>
              <button
                class="favorite-add-cart"
                type="button"
                data-add-favorite="${product.id}"
              >
                Adicionar <span aria-hidden="true">+</span>
              </button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

favoriteGrid.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const removeButton = target.closest("[data-remove-favorite]");
  if (removeButton) {
    favorites.delete(Number(removeButton.dataset.removeFavorite));
    window.nexusFavorites.save(favorites);
    renderFavorites();
    showFavoritesToast("Removido dos favoritos.");
    return;
  }

  const addButton = target.closest("[data-add-favorite]");
  if (addButton) {
    const productId = Number(addButton.dataset.addFavorite);
    cart.set(productId, (cart.get(productId) || 0) + 1);
    window.nexusCart.save(cart);
    renderFavorites();
    showFavoritesToast("Produto adicionado ao carrinho!");
  }
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
renderFavorites();
