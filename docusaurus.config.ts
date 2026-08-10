import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkPlantuml from './src/remark/plantuml.mjs';

const config: Config = {
  title: 'Loja FIAP · Hub de Docs',
  tagline: 'Tudo que o seu grupo precisa para integrar o e-commerce da turma',
  favicon: 'img/favicon.svg',

  // Docusaurus Faster (Rspack + SWC): build muito mais leve/rápido — evita o
  // OOM na VPS durante a renderização estática. Depende de @docusaurus/faster.
  future: {
    // Exigido pelo ssgWorkerThreads que o `faster` ativa (mudança leve de post-build).
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
    },
    faster: true,
  },

  url: process.env.DOCS_URL || 'https://loja-fiap.exemplo',
  baseUrl: process.env.DOCS_BASE_URL || '/',

  organizationName: 'fiap-2tdspg',
  projectName: 'docs-hub',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  // Mermaid nativo (```mermaid).
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: [
    '@docusaurus/theme-mermaid',
    // Tema que renderiza a referência gerada do OpenAPI.
    'docusaurus-theme-openapi-docs',
    // Busca local (offline), sem serviço externo.
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['pt', 'en'],
        indexDocs: true,
        indexPages: true,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
        searchResultContextMaxLength: 50,
      },
    ],
  ],

  plugins: [
    // Gera a referência de API a partir do spec OpenAPI do backend (/docs/json).
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'api',
        docsPluginId: 'classic',
        config: {
          ecommerce: {
            specPath: 'openapi/ecommerce.json',
            outputDir: 'docs/api',
            downloadUrl: 'http://localhost:3333/docs/json',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
            hideSendButton: false,
          },
        },
      },
    ],
  ],

  // KaTeX (offline — copiado para static/katex) + fontes da marca.
  stylesheets: [
    {
      href: '/katex/katex.min.css',
      type: 'text/css',
    },
    'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/docs',
          breadcrumbs: true,
          docItemComponent: '@theme/ApiItem',
          remarkPlugins: [remarkMath, remarkPlantuml],
          rehypePlugins: [rehypeKatex],
        },
        // Diário de Aula: blog-devlog da turma. Cada aula vira um post datado,
        // com o passo a passo do que foi feito + os exercícios.
        blog: {
          routeBasePath: '/diario',
          path: 'blog',
          blogTitle: 'Diário de Aula · 2TDSPG',
          blogDescription: 'O que fizemos em cada aula, passo a passo, com os exercícios.',
          blogSidebarTitle: 'Aulas',
          blogSidebarCount: 'ALL',
          // Diário de curso: ordem cronológica (Semana 1 → 2 → ...), não "mais recente primeiro".
          sortPosts: 'ascending',
          showReadingTime: true,
          postsPerPage: 10,
          feedOptions: {
            type: ['rss', 'atom'],
            title: 'Diário de Aula · 2TDSPG',
            description: 'O passo a passo de cada aula da turma.',
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    // Mermaid segue o design system (claro/escuro).
    mermaid: {
      theme: { light: 'neutral', dark: 'dark' },
    },
    navbar: {
      title: 'Loja FIAP',
      logo: {
        alt: 'Loja FIAP',
        src: 'img/logo-lojafiap.svg',
      },
      items: [
        { type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Documentação' },
        { type: 'docSidebar', sidebarId: 'openApiSidebar', position: 'left', label: 'API' },
        { to: '/diario', label: 'Diário de Aula', position: 'left' },
        { type: 'docsVersionDropdown', position: 'right' },
        { href: 'http://localhost:3333/docs', label: 'Swagger (API viva)', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Comece aqui',
          items: [
            { label: 'O que é este hub', to: '/docs/intro' },
            { label: 'Primeiros passos', to: '/docs/comece-aqui/primeiros-passos' },
          ],
        },
        {
          title: 'Referência',
          items: [
            { label: 'Endpoints', to: '/docs/endpoints/visao-geral' },
            { label: 'Swagger (API viva)', href: 'http://localhost:3333/docs' },
          ],
        },
        {
          title: 'Turma',
          items: [
            { label: 'Arquitetura', to: '/docs/arquitetura/visao-geral' },
            { label: 'Estudos de caso', to: '/docs/estudos-de-caso/loja-de-games' },
          ],
        },
      ],
      copyright: `Loja FIAP · 2TDSPG · ${new Date().getFullYear()}. Feito para a turma.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'tsx', 'jsx', 'diff', 'http'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
