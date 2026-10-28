window.nexusFavorites = {
  read() {
    const storedValue = localStorage.getItem("nexus-hardware-favorites");
    if (!storedValue) return new Set();

    let parsedFavorites;
    try {
      parsedFavorites = JSON.parse(storedValue);
    } catch (error) {
      console.error("Não foi possível ler os favoritos salvos.", error);
      localStorage.removeItem("nexus-hardware-favorites");
      return new Set();
    }

    if (!Array.isArray(parsedFavorites)) {
      console.error("Os favoritos salvos têm um formato inválido.");
      localStorage.removeItem("nexus-hardware-favorites");
      return new Set();
    }

    return new Set(
      parsedFavorites
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0),
    );
  },
  save(favorites) {
    localStorage.setItem(
      "nexus-hardware-favorites",
      JSON.stringify([...favorites]),
    );
  }
};
