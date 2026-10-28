const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const togglePasswordButton = document.querySelector("#toggle-password");
const formMessage = document.querySelector("#form-message");
let demoAccount = null;

try {
  const savedAccount = sessionStorage.getItem("nexus-demo-account");
  if (savedAccount) {
    demoAccount = JSON.parse(savedAccount);
    emailInput.value = demoAccount.email;
    passwordInput.value = demoAccount.password;
  }
} catch {
  formMessage.textContent = "Não foi possível recuperar os dados temporários do cadastro.";
}

togglePasswordButton.addEventListener("click", () => {
  const showPassword = passwordInput.type === "password";
  passwordInput.type = showPassword ? "text" : "password";
  togglePasswordButton.setAttribute("aria-pressed", String(showPassword));
  togglePasswordButton.setAttribute("aria-label", showPassword ? "Ocultar senha" : "Mostrar senha");
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (
    !demoAccount ||
    emailInput.value.trim() !== demoAccount.email ||
    passwordInput.value !== demoAccount.password
  ) {
    formMessage.textContent =
      "E-mail ou senha incorretos. Confira os dados ou crie uma conta para continuar.";
    return;
  }

  try {
    sessionStorage.setItem("nexus-demo-authenticated", "true");
    window.location.href = "loja.html";
  } catch {
    formMessage.textContent = "Não foi possível concluir o acesso. Tente novamente.";
  }
});

document.querySelector("#forgot-password").addEventListener("click", () => {
  formMessage.textContent = "A recuperação de senha ficará disponível quando a autenticação for configurada.";
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
