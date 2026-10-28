const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const productId = Number(new URLSearchParams(window.location.search).get("id"));
const product = window.nexusProducts.find((item) => item.id === productId);
const productDetail = document.querySelector("#product-detail");
const savedCart = window.nexusCart.read();
window.nexusProducts.filter((item) => item.unavailable).forEach((item) => savedCart.delete(item.id));
window.nexusCart.save(savedCart);
const cartCount = [...savedCart.values()].reduce((total, quantity) => total + quantity, 0);

document.querySelector("#detail-cart-count").textContent = cartCount;
document.querySelector("#current-year").textContent = new Date().getFullYear();

function renderVisual(item) {
  if (item.image) return `<img class="detail-photo" src="${item.image}" alt="${item.name}">`;
  if (item.icon) return `<span class="detail-icon" aria-hidden="true">${window.nexusHardwareIcons[item.icon]}</span>`;
  return `<span class="detail-emoji" aria-hidden="true">${item.emoji}</span>`;
}

function renderNotFound() {
  document.title = "Produto não encontrado | Nexus Hardware";
  productDetail.innerHTML = `
    <section class="product-not-found">
      <div class="eyebrow"><span></span> PRODUTO INDISPONÍVEL</div>
      <h1>ESSE ITEM NÃO ESTÁ <em>NO CATÁLOGO.</em></h1>
      <p>Volte para a loja para ver os produtos disponíveis.</p>
      <a class="button button-primary" href="loja.html#products">Voltar aos produtos <span aria-hidden="true">→</span></a>
    </section>
  `;
  document.querySelector(".reviews-section").hidden = true;
  document.querySelector(".product-breadcrumb").hidden = true;
}

function renderProduct(item) {
  const displayName = item.name;
  document.title = `${displayName} | Nexus Hardware`;
  document.querySelector('meta[name="description"]').content =
    `${displayName}: veja descrição, especificações e avaliações na Nexus Hardware.`;
  const productBreadcrumb = document.querySelector(".product-breadcrumb");
  productBreadcrumb.innerHTML = `
    <a href="loja.html">Início</a><span>/</span>
    <span>${item.category}</span><span>/</span>
    <span id="breadcrumb-product">${displayName}</span>
  `;
  productDetail.innerHTML = `
    <section class="product-detail-layout">
      <div class="detail-visual">
        ${renderVisual(item)}
      </div>
      <div class="detail-info">
        <span class="detail-category">${item.category}</span>
        <h1>${displayName}</h1>
        <button
          class="detail-rating-link"
          type="button"
          id="scroll-to-reviews"
          aria-label="Ver avaliação ${item.rating} de 5 e ${item.reviews} avaliações"
        >
          <span class="detail-stars" style="--rating: ${Number(item.rating) * 20}%" aria-hidden="true">★★★★★</span>
          <strong>${item.rating}</strong>
          <span>(${item.reviews} avaliações)</span>
          <span aria-hidden="true">↓</span>
        </button>
        <small class="rating-demo-hint">Avaliação e quantidade demonstrativas</small>
        <p class="detail-description">${item.description}</p>
        <ul class="detail-highlights">
          ${item.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}
        </ul>
        ${item.unavailable ? "" : `
          <div class="detail-purchase">
            <div class="detail-price${item.priceLabel ? " special-price" : ""}">
              ${item.priceLabel || currency.format(item.price)}
            </div>
            <p class="detail-installment">
              ou 10x de ${currency.format(item.price / 10)} sem juros
            </p>
            <button
              class="button button-primary detail-add-cart"
              id="detail-add-cart"
              type="button"
            >
              Adicionar ao carrinho <span aria-hidden="true">+</span>
            </button>
            <p class="detail-shipping">
              <span aria-hidden="true">↗</span>
              Frete grátis em compras acima de R$ 499
            </p>
          </div>
        `}
      </div>
    </section>
    <section class="specs-section">
      <div class="detail-section-heading">
        <div>
          <div class="eyebrow"><span></span> FICHA TÉCNICA</div>
          <h2>DETALHES DO <em>PRODUTO</em></h2>
        </div>
      </div>
      <div class="specs-grid">
        ${item.specifications
          .map(
            ([label, value]) => `
              <div class="spec-row">
                <span>${label}</span>
                <strong>${value}</strong>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;

  document.querySelector("#reviews-content").innerHTML = `
    <div class="rating-summary">
      <strong class="rating-big">${item.rating}</strong>
      <span
        class="detail-stars"
        style="--rating: ${Number(item.rating) * 20}%"
        aria-label="${item.rating} de 5 estrelas"
      >★★★★★</span>
      <p>de 5 estrelas<br>${item.reviews} avaliações</p>
    </div>
    <div class="review-empty">
      <h3>Avaliações escritas</h3>
      <p>Os comentários dos clientes aparecerão aqui quando forem cadastrados e verificados.</p>
      <p class="review-notice">Os números exibidos nesta demonstração não são avaliações reais.</p>
    </div>
  `;

  document.querySelector(".reviews-section").hidden = false;
  const reviewsButton = document.querySelector("#scroll-to-reviews");
  if (reviewsButton) {
    reviewsButton.addEventListener("click", () => {
      document.querySelector("#reviews").scrollIntoView({ behavior: "smooth" });
    });
  }

  const addToCartButton = document.querySelector("#detail-add-cart");
  if (addToCartButton) {
    addToCartButton.addEventListener("click", () => {
      const cart = window.nexusCart.read();
      cart.set(item.id, (cart.get(item.id) || 0) + 1);
      window.nexusCart.save(cart);

      document.querySelector("#detail-cart-count").textContent = [
        ...cart.values(),
      ].reduce((total, quantity) => total + quantity, 0);

      const toast = document.querySelector("#product-toast");
      toast.textContent = "Produto adicionado ao carrinho!";
      toast.classList.add("show");
      window.setTimeout(() => toast.classList.remove("show"), 2200);
    });
  }
}

if (product) renderProduct(product);
else renderNotFound();
