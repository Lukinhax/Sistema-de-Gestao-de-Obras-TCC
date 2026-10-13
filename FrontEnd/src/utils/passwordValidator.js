// Política de senha (mesma regra aplicada no backend)
export const PASSWORD_RULES = [
  { id: 'length', label: 'No mínimo 6 caracteres', test: (s) => s.length >= 6 },
  { id: 'upper', label: 'Pelo menos 1 letra maiúscula', test: (s) => /[A-Z]/.test(s) },
  { id: 'number', label: 'Pelo menos 1 número', test: (s) => /\d/.test(s) },
  { id: 'special', label: 'Pelo menos 1 caractere especial (!@#$%...)', test: (s) => /[^A-Za-z0-9\s]/.test(s) },
];

/**
 * Retorna uma mensagem de erro ou null se a senha for válida.
 */
export function validatePassword(senha = '') {
  const falhas = PASSWORD_RULES.filter((r) => !r.test(senha));
  if (falhas.length === 0) return null;
  return `A senha deve conter: ${falhas.map((r) => r.label.toLowerCase()).join(', ')}.`;
}
