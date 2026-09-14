/**
 * Emoji temático por tag do OpenAPI (chave = nome da tag / label da categoria).
 * Compartilhado entre o DocCard (cards) e o sidebars.ts (menu lateral),
 * para manter a identidade visual consistente e sobreviver à regeneração
 * dos docs pelo plugin OpenAPI.
 */
export const API_TAG_EMOJI: Record<string, string> = {
  Catálogo: '🛍️',
  Mídia: '🖼️',
  Avaliações: '⭐',
  Localização: '📍',
  'Auth Cliente': '🔐',
  Cliente: '👤',
  Carrinho: '🛒',
  Pedidos: '🧾',
  'Pedidos (loja)': '🏬',
  'Clientes (loja)': '👥',
  Comunicações: '📣',
  Pagamento: '💳',
  Estoque: '📦',
  Webhooks: '🔔',
  Sandbox: '🧪',
  Relatórios: '📊',
  Configurações: '⚙️',
  Ensino: '🎓',
  Admin: '🛡️',
  'Loja (aluno)': '🏪',
};
