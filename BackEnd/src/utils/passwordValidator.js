// Política de senha: mínimo 6 caracteres, ao menos 1 letra maiúscula,
// 1 número e 1 caractere especial.
const PASSWORD_RULES = [
  { test: (s) => s.length >= 6, message: "no mínimo 6 caracteres" },
  { test: (s) => /[A-Z]/.test(s), message: "pelo menos 1 letra maiúscula" },
  { test: (s) => /\d/.test(s), message: "pelo menos 1 número" },
  { test: (s) => /[^A-Za-z0-9\s]/.test(s), message: "pelo menos 1 caractere especial" },
];

/**
 * Valida a senha conforme a política de segurança.
 * @param {string} senha
 * @returns {string|null} Mensagem de erro ou null se a senha for válida.
 */
function validatePassword(senha) {
  if (typeof senha !== "string") return "Senha inválida.";
  const falhas = PASSWORD_RULES.filter((r) => !r.test(senha)).map((r) => r.message);
  if (falhas.length === 0) return null;
  return `A senha deve conter: ${falhas.join(", ")}.`;
}

module.exports = { validatePassword };
