/**
 * Utilitários para manipulação de datas sem bug de timezone.
 *
 * PROBLEMA: O PostgreSQL retorna colunas do tipo DATE como strings ISO 8601 com
 * sufixo UTC (ex: "2025-08-12T03:00:00.000Z"). Quando o JS faz `new Date(str)`,
 * interpreta essa timestamp em UTC; ao exibir com toLocaleDateString no fuso
 * -03:00 (Brasil), o horário local se torna 2025-08-11T21:00:00, mostrando o
 * dia ANTERIOR ao escolhido.
 *
 * SOLUÇÃO: Extrair apenas a parte "YYYY-MM-DD" da string e construir o Date
 * sem informação de horário, o que faz o JS interpretá-la como meia-noite no
 * fuso LOCAL, evitando qualquer subtração de timezone.
 */

/**
 * Converte uma string de data (vinda do banco) para um objeto Date sem bug de TZ.
 * Aceita formatos "YYYY-MM-DD" e "YYYY-MM-DDTHH:mm:ss.sssZ".
 * @param {string} dateString
 * @returns {Date | null}
 */
export function parseLocalDate(dateString) {
  if (!dateString) return null;
  // Pega apenas a parte "YYYY-MM-DD", descartando hora/timezone
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return null;
  // Constrói o Date no fuso local (sem UTC offset)
  return new Date(year, month - 1, day);
}

/**
 * Formata uma string de data do banco para o padrão brasileiro (DD/MM/AAAA),
 * sem o bug de timezone que causa a exibição do dia anterior.
 * @param {string} dateString
 * @returns {string}
 */
export function formatDateBR(dateString) {
  if (!dateString) return '--/--/----';
  const date = parseLocalDate(dateString);
  if (!date || isNaN(date.getTime())) return '--/--/----';
  return date.toLocaleDateString('pt-BR');
}

/**
 * Verifica se uma string de data é válida e está em um intervalo plausível.
 * @param {string} dateString
 * @returns {boolean}
 */
export function isDateValid(dateString) {
  if (!dateString) return false;
  const date = parseLocalDate(dateString);
  if (!date || isNaN(date.getTime())) return false;
  return date.getFullYear() > 2000 && date.getFullYear() < 2100;
}
