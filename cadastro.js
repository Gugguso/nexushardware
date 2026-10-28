const registerForm = document.querySelector("#register-form");
const registerMessage = document.querySelector("#register-message");
const registerHeading = document.querySelector("#register-heading");

try {
  if (localStorage.getItem("nexus-demo-account-created") === "true") {
    registerHeading.firstChild.textContent = "CRIE SUA ";
    registerHeading.querySelector("em").textContent = "CONTA.";
  }
} catch {
  registerMessage.textContent = "Não foi possível verificar o estado da conta neste navegador.";
}

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const account = {
    name: registerForm.elements.name.value.trim(),
    email: registerForm.elements.email.value.trim(),
    password: registerForm.elements.password.value,
  };

  try {
    sessionStorage.setItem("nexus-demo-account", JSON.stringify(account));
    localStorage.setItem("nexus-demo-account-created", "true");
    window.location.href = "login.html";
  } catch {
    registerMessage.textContent =
      "Não foi possível continuar neste navegador. Verifique as permissões de armazenamento e tente novamente.";
  }
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
