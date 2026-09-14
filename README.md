# mockmerce-doc · Hub de documentação

Hub de tutoriais e referência do projeto **MockMerce** (turma 2TDSPG), feito com
**Docusaurus 3**. Segue o mesmo design system do painel do aluno (verde `#22c55e`, dark mode)
e reúne guias, diagramas, estudos de caso e a **referência da API gerada do OpenAPI**.

> Docusaurus 3 · MDX · TypeScript

### 🧩 Projeto MockMerce — 3 repositórios

| Repo | O que é |
|---|---|
| **mockmerce-back** | A API que todos os grupos consomem |
| **mockmerce-alun** | Painel web (estilo Shopify) para os alunos gerenciarem a loja |
| **mockmerce-doc** (este) | Hub de documentação/tutoriais (Docusaurus) |

---

## O que tem dentro

- **Comece aqui** — o que é o projeto, as 3 camadas de identidade, primeira chamada.
- **Guias** — autenticação, fluxo de compra, produtos/variantes, webhooks, deploy.
- **Arquitetura & Diagramas** — visão geral (Mermaid), modelo de dados (ER), sequência do
  checkout (PlantUML) e cálculos do pedido (KaTeX).
- **Estudos de caso** — decisões reais de grupos montando loja e app mobile.
- **Referência de Endpoints** — guia curado + **referência OpenAPI automática** (aba "API").

## Rodar

```bash
npm install
npm start -- --port 3100      # dev server em http://localhost:3100
npm run build                 # build estático em ./build
npm run serve                 # servir o build localmente
```

> Use `--port 3100` (3000/3001 podem estar ocupadas por outros apps). Evite rodar **dois**
> dev servers na mesma pasta — eles brigam pelo cache `.docusaurus`. Se o dev server travar
> (`@generated`/HMR do rspack), rode `rm -rf .docusaurus` e reinicie, ou use `build` + `serve`.

## Recursos ativados

| Recurso | Onde |
|---|---|
| Busca local (offline) | `@easyops-cn/docusaurus-search-local` |
| Mermaid | ```` ```mermaid ```` (theme-mermaid) |
| PlantUML | ```` ```plantuml ```` (plugin próprio em `src/remark/plantuml.mjs`) |
| Tabs / Admonitions / MDX | nativos + componente `src/components/Endpoint` |
| Math (KaTeX) | `remark-math` + `rehype-katex` (CSS local em `static/katex`) |
| Referência OpenAPI | `docusaurus-plugin-openapi-docs` + `docusaurus-theme-openapi-docs` |
| Versionamento | `versioned_docs/` (versão `1.0` + `Next`) |
| Breadcrumbs | nativo (sidebar) |

## Atualizar a referência de API (OpenAPI)

O spec vem do backend (`mockmerce-back`, em `/docs/json`). Para atualizar depois de mudar a API:

```bash
# 1. baixe o spec novo (backend precisa estar no ar)
curl http://localhost:3333/docs/json -o openapi/ecommerce.json

# 2. regenere as páginas E propague para a versão publicada
npm run api:sync
```

As páginas geradas ficam em `docs/api/` (não editar à mão).

:warning: **Por que o `api:sync` e não só o `gen-api-docs`:** o plugin escreve apenas em
`docs/api`, que é a versão **Next**. Como o site serve a **1.0**, sem o passo de
propagação a regeneração não aparece para ninguém. O `scripts/sync-versioned-api.cjs`
copia as páginas para `versioned_docs/version-1.0/api` e reescreve o `openApiSidebar` em
`versioned_sidebars/version-1.0-sidebars.json`.

**Tag nova no backend?** Adicione o emoji dela em `src/apiTagEmoji.ts` — o script avisa se
alguma categoria ficou sem. O mesmo mapa alimenta o menu lateral e os cards.

## Publicar uma nova versão da doc

```bash
npm run docusaurus docs:version 1.1
```

Isso congela o conteúdo atual como `1.1`; o conteúdo em `docs/` vira a versão **Next**.
