---
slug: semana-02-tanstack-query
title: "Semana 2 · Segunda — TanStack Query: pare de cuidar dos dados na mão"
authors: [professor]
tags: [react-native, tanstack-query, semana-02, exercicios]
date: 2026-08-10
---

Hoje começamos a **Semana 2 — Consumo e Integração com API · pt. 2**. Construímos direto
sobre a camada de serviços (Axios) da Semana 1 e adicionamos o **TanStack Query**: cache,
revalidação e mutations otimistas.

> **A frase da semana:** na Semana 1 a gente aprendeu a **buscar** dados. Nesta semana a
> gente para de **cuidar** deles na mão.

<!-- truncate -->

## Por que trocar `useEffect` + `useState`

Partimos da tela da Semana 1 que busca produtos manualmente:

```tsx
// Funciona — mas repare em quanta coisa a gente gerencia:
const [produtos, setProdutos] = useState<ProductSummary[]>([]);
const [loading, setLoading] = useState(true);
const [erro, setErro] = useState<string | null>(null);

useEffect(() => {
  let vivo = true;
  setLoading(true);
  listProducts()
    .then((res) => vivo && setProdutos(res.data))
    .catch((e) => vivo && setErro(e.message))
    .finally(() => vivo && setLoading(false));
  return () => { vivo = false; };
}, []);
```

Três dores que ficaram no ar (guarde-as — o Query mata as três):

1. A **mesma** busca em 3 telas = **3 requests**, mesmo com dado idêntico.
2. Voltar para uma tela já visitada mostra **spinner de novo**.
3. Aquele `let vivo = true` existe só para não dar `setState` em componente desmontado.

## O modelo mental (só três ideias)

```mermaid
flowchart TD
    C[Componente] -->|usa| Q["useQuery(['products'], listProducts)"]
    Q --> Cache[("CACHE do QueryClient<br/>fonte única da verdade")]
    Cache --> D{"O dado está fresco?"}
    D -->|sim| S["Serve do cache · instantâneo"]
    D -->|não| R["Busca em background e atualiza"]
```

- **Query = leitura**, identificada por uma **key**. A key é o "endereço" do dado no cache.
- **staleTime** = por quanto tempo o dado é "fresco". Fresco **não** refaz request.
- **Mutation = escrita** (POST/PATCH/DELETE). Depois de escrever, a gente **invalida** a
  leitura para ela se atualizar.

## O que escrevemos ao vivo

**1. O `QueryClient`** — `src/lib/queryClient.ts`, com `staleTime` e um `retry` que **não**
repete em 4xx (401/404/422 não melhoram com retry).

**2. O provider** — envolvemos o app com `<QueryClientProvider>` no `App.tsx`. **A ordem
importa:** o Query fica **por fora** do `SessionProvider`, porque a sessão usa `useQueryClient`.

**3. A primeira query** — trocamos a tela da retomada por um hook:

```tsx
// src/hooks/useProducts.ts
export function useProducts(params = {}) {
  return useQuery({
    queryKey: ['products', 'list', params], // os params ENTRAM na key
    queryFn: () => listProducts(params),
  });
}

// na tela:
const { data, isLoading, isError, error, refetch } = useProducts();
```

Rodamos e fizemos o teste: entrar no produto, voltar para a lista → **não pisca spinner**
(veio do cache). Foi o momento "uau" do dia.

**4. Query keys** — a lição que evita 80% dos bugs do semestre:

> Quem **lê** e quem **invalida** têm que usar a **mesma** key. Se um usa `['products']` e o
> outro `['product']`, a invalidação não acontece — e você jura que "o Query está bugado".
> Não está: a key não bateu.

A key inclui os `params` de busca — procurar "camisa" e "tênis" são **dois caches** distintos.

**5. Mutation + atualização otimista** — o ápice. O ciclo de uma escrita otimista:

```mermaid
flowchart TD
    Click["Clicar 'adicionar'"] --> OM["onMutate — otimismo<br/>cancela buscas em voo · tira FOTO do cache · pinta o palpite"]
    OM --> Req[/"request viaja..."/]
    Req -->|deu ruim| OE["onError — rollback<br/>restaura a FOTO do cache"]
    Req -->|deu certo| OK["Servidor confirmou"]
    OE --> OS["onSettled<br/>invalida a query do carrinho para bater com o servidor"]
    OK --> OS
```

Mostramos os dois caminhos:

- **Feliz:** clicar em "adicionar" → o item aparece no carrinho **na hora**, antes da resposta.
- **Triste:** com o backend fora, o item aparece e **some** (rollback). Isso é honestidade de
  UI: mostramos o otimismo, mas não mentimos quando falha.

> **Detalhe que separa nota 7 de nota 10:** para pintar o item otimista precisamos de `name` e
> `unitPrice` **na mão** — o servidor tem, mas ainda não recebemos a resposta. Por isso a
> mutation recebe esses campos. Otimismo custa um pouquinho de dado local.

## Mão na massa (em aula)

Cada grupo, no próprio app, **migrou a tela de listagem para `useProducts`**: lista via
`useQuery`, com `isLoading` e `isError` tratados. O erro nº 1 foi **esquecer o
`QueryClientProvider`** — se a sua lista não carregou, comece por aí.

## 📌 Dever de casa (segunda → quarta) · ~40 min

Entregar no **início da aula de quarta (12/08)**. Feito no app do seu grupo, consumindo a API
da turma. Use o `X-Student-RM` de **quem está codando** — isso conta na avaliação.

1. **Instale e ligue o Query.** `npm i @tanstack/react-query`. Envolva o app com
   `<QueryClientProvider>` usando um `QueryClient` criado em arquivo próprio.
2. **Migre a listagem** para `useProducts()` com `useQuery`. A tela trata `isLoading`
   (spinner), `isError` (mensagem + botão de tentar de novo) e a **lista vazia**.
3. **Busca:** ligue um `TextInput` de busca que faça **parte da query key**
   (`['products','list',{ search }]`). Buscas diferentes viram caches diferentes; voltar a
   uma busca já feita é instantâneo.
4. **Responda em 2 linhas no README do grupo:** ao digitar rápido no campo de busca, quantas
   requests saem e por quê? (Dica: `staleTime` e `placeholderData`.)

**Critério de pronto:** lista carrega via `useQuery`; **sem** `useEffect`/`useState` para
data/loading/erro na tela; a busca reflete na query key.

## Quarta é cronometrado 🕒

Venham com a lista **já migrada** — vamos atacar **carrinho e mutations** em três blocos:

1. `useProduct(id)` + tela de detalhe (lembre: preço e estoque vivem em `variants[]`).
2. `useCart()` **dependente de login** (`enabled`) + login do comprador.
3. `useCartMutations` com **atualização otimista** (adicionar, +/− quantidade, remover) — o
   entregável do dia é o **rollback** funcionando com o backend fora.

## Lembretes de API

- **Base (nuvem):** `https://api.mockmerce.com.br/v1` — os apps conectam no backend na
  nuvem, não em `localhost`. Swagger em `https://api.mockmerce.com.br/docs`.
- Headers sempre: `X-API-Key` (grupo) e `X-Student-RM` (rastreio). Rotas de comprador exigem
  também `Authorization: Bearer`.
- **Unidade vendável = variante.** Carrinho/checkout usam `variantId`; preço/estoque vivem em
  `variants[]`.
