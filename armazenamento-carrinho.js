window.nexusCart = {
  read() {
    const storedValue = localStorage.getItem("nexus-hardware-cart");
    if (!storedValue) return new Map();

    let parsedCart;
    try {
      parsedCart = JSON.parse(storedValue);
    } catch (error) {
      console.error("Não foi possível ler o carrinho salvo.", error);
      localStorage.removeItem("nexus-hardware-cart");
      return new Map();
    }

    if (!parsedCart || typeof parsedCart !== "object" || Array.isArray(parsedCart)) {
      console.error("O carrinho salvo tem um formato inválido.");
      localStorage.removeItem("nexus-hardware-cart");
      return new Map();
    }

    return new Map(
      Object.entries(parsedCart)
        .map(([id, quantity]) => [Number(id), Number(quantity)])
        .filter(
          ([id, quantity]) =>
            Number.isInteger(id) &&
            Number.isInteger(quantity) &&
            id > 0 &&
            quantity > 0,
        ),
    );
  },
  save(cart) {
    localStorage.setItem("nexus-hardware-cart", JSON.stringify(Object.fromEntries(cart)));
  }
};
