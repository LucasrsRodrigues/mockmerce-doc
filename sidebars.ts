import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
// Sidebar gerado pelo plugin OpenAPI (docs/api). Exporta { apisidebar: [...] }.
import openapiSidebar from './docs/api/sidebar';
import { API_TAG_EMOJI } from './src/apiTagEmoji';

// O default export do sidebar gerado JÁ é o array de itens (export default sidebar.apisidebar).
const mod = openapiSidebar as any;
const rawApiItems = (Array.isArray(mod) ? mod : mod.default ?? []) as any[];

// Prefixa cada categoria (tag) com um emoji temático — feito aqui (e não no
// spec) para sobreviver à regeneração dos docs pelo plugin OpenAPI.
const apiItems = rawApiItems.map((item) => {
  if (item?.type === 'category' && typeof item.label === 'string') {
    const emoji = API_TAG_EMOJI[item.label];
    if (emoji && !item.label.startsWith(emoji)) {
      return { ...item, label: `${emoji} ${item.label}` };
    }
  }
  return item;
});

/**
 * Sidebar do Hub — explícito para controlar ordem e agrupamento.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Comece aqui',
      collapsed: false,
      items: [
        'comece-aqui/o-que-e',
        'comece-aqui/conceitos',
        'comece-aqui/primeiros-passos',
      ],
    },
    {
      type: 'category',
      label: 'Guias',
      items: [
        'guias/autenticacao',
        'guias/fluxo-de-compra',
        'guias/produtos-e-variantes',
        'guias/upload-de-midia',
        'guias/avaliacoes',
        'guias/localizacao-e-mapa',
        'guias/webhooks',
        'guias/deploy',
      ],
    },
    {
      type: 'category',
      label: 'Arquitetura & Diagramas',
      items: [
        'arquitetura/visao-geral',
        'arquitetura/modelo-de-dados',
        'arquitetura/checkout-sequencia',
        'arquitetura/calculos',
      ],
    },
    {
      type: 'category',
      label: 'Estudos de caso',
      items: [
        'estudos-de-caso/loja-de-games',
        'estudos-de-caso/integracao-mobile',
      ],
    },
    {
      type: 'category',
      label: 'Referência de Endpoints (guia)',
      items: [
        'endpoints/visao-geral',
        'endpoints/catalogo',
        'endpoints/carrinho-e-pedidos',
        'endpoints/loja-aluno',
        'endpoints/webhooks',
      ],
    },
  ],

  // Sidebar DEDICADO da referência OpenAPI — alimenta a aba "API" na navbar.
  openApiSidebar: apiItems,
};

export default sidebars;
