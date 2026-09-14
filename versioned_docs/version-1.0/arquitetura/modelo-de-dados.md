---
id: modelo-de-dados
title: Modelo de dados
sidebar_label: Modelo de dados
description: Diagrama ER das principais entidades — grupo, catálogo, clientes e pedidos.
---

# Modelo de dados

As entidades centrais e como se relacionam. Tudo pendura em **`Group`** (o tenant).

```mermaid
erDiagram
  Group ||--o{ Student : "tem"
  Group ||--o{ ApiKey : "emite"
  Group ||--o{ Product : "possui"
  Group ||--o{ Customer : "possui"
  Group ||--o{ Order : "possui"
  Group ||--|| GroupConfig : "config da loja"
  Group ||--o{ MediaAsset : "arquivos (S3)"
  Group ||--o{ Review : "avaliações"

  Product ||--o{ ProductVariant : "vende por"
  Product ||--o{ ProductImage : "exibe"
  MediaAsset ||--o{ ProductImage : "é usada em"
  ProductVariant ||--o{ OrderItem : "vira"

  Customer ||--o{ Order : "faz"
  Customer ||--o{ Review : "avalia"
  Product ||--o{ Review : "recebe"
  Customer ||--o{ Cart : "tem"
  Order ||--o{ OrderItem : "contém"
  Cart ||--o{ CartItem : "contém"

  Group {
    string id PK
    string name
    string apiKeyHash "chave primária (professor)"
  }
  ApiKey {
    string id PK
    string name
    string keyPrefix
    datetime revokedAt "null = ativa"
  }
  ProductVariant {
    string id PK
    string sku
    float price
    int stock
  }
  Review {
    int rating "1 a 5"
    string comment
    boolean hidden "ocultada pela loja"
    string orderId FK "prova da compra"
  }
  MediaAsset {
    string id PK
    string kind "IMAGE ou VIDEO"
    string key "caminho no bucket"
    string url "URL pública"
    int sizeBytes
  }
  ProductImage {
    string id PK
    string mediaId FK "null se URL externa"
    string kind "IMAGE ou VIDEO"
    boolean isPrimary "a capa"
  }
  Order {
    string id PK
    string status "PENDING/PAID/..."
    float total
  }
```

## Leitura rápida

- **`Group`** é o centro: alunos, chaves, produtos, clientes e pedidos são todos _dele_.
- **`ProductVariant`** é a **unidade vendável** — carrega `sku`, `price` e `stock`, e é o
  que vira `OrderItem`.
- **`ApiKey`** guarda só o **hash**; `revokedAt = null` significa chave ativa. Convive com
  a `Group.apiKeyHash` (a chave primária criada pelo professor).
- **`Review`** é a avaliação do cliente: nota, comentário e fotos. O `orderId`
  é a **prova da compra** — é ele que acende o selo "compra verificada". Ocultar
  (`hidden`) tira da vitrine e da média, sem apagar o registro.
- **`MediaAsset`** é o **arquivo** na biblioteca da loja (o binário vive no S3, aqui fica o
  ponteiro); **`ProductImage`** é o **vínculo** desse arquivo com um produto ou variante.
  Por isso a mesma foto pode aparecer em vários produtos, e tirar a foto de um produto não
  apaga o arquivo.
- **`GroupConfig`** guarda a configuração da loja (identidade, contato, tema, regional).

:::note Isolamento na prática
Nenhuma dessas tabelas é consultada sem o filtro de `groupId` (via `tenantScope`). É isso
que garante que um grupo nunca leia dados de outro.
:::
