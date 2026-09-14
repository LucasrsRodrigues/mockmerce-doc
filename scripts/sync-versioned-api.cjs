/**
 * Propaga a referência de API recém-gerada para a versão publicada da doc.
 *
 * O plugin OpenAPI só escreve em `docs/api` — ou seja, na versão **Next**. Como o
 * site serve a **1.0**, sem este passo a regeneração não aparece para ninguém.
 * Aqui copiamos as páginas para `versioned_docs/version-1.0/api` e convertemos o
 * sidebar gerado (TS) no JSON do sidebar versionado, aplicando os mesmos emojis
 * por tag que o `sidebars.ts` aplica na Next.
 *
 * Uso:  node scripts/sync-versioned-api.cjs [versão]      (padrão: 1.0)
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const version = process.argv[2] ?? '1.0';
// 1) páginas geradas → versão publicada
const geradas = path.join(root, 'docs/api');
const destino = path.join(root, `versioned_docs/version-${version}/api`);
fs.rmSync(destino, { recursive: true, force: true });
fs.cpSync(geradas, destino, { recursive: true });

// 2) sidebar gerado (TS) → sidebar versionado (JSON)
const src = fs.readFileSync(path.join(geradas, 'sidebar.ts'), 'utf8');
const js = src
  .replace(/^import type .*$/m, '')
  .replace('const sidebar: SidebarsConfig =', 'const sidebar =')
  .replace('export default sidebar.apisidebar;', 'module.exports = sidebar.apisidebar;');
const tmp = path.join(root, '.apisidebar.tmp.cjs');
fs.writeFileSync(tmp, js);
const items = require(tmp);
fs.rmSync(tmp);

// Lê o mapa de emojis direto do TS (objeto literal simples).
const emojiSrc = fs.readFileSync(path.join(root, 'src/apiTagEmoji.ts'), 'utf8');
const EMOJI = {};
for (const m of emojiSrc.matchAll(/^\s*'?([^':\n]+)'?:\s*'([^']+)',$/gm)) {
  EMOJI[m[1].trim()] = m[2];
}

const withEmoji = items.map((item) => {
  if (item?.type === 'category' && typeof item.label === 'string') {
    const e = EMOJI[item.label];
    if (e && !item.label.startsWith(e)) return { ...item, label: `${e} ${item.label}` };
  }
  return item;
});

const file = path.join(root, `versioned_sidebars/version-${version}-sidebars.json`);
const sidebars = JSON.parse(fs.readFileSync(file, 'utf8'));
sidebars.openApiSidebar = withEmoji;
fs.writeFileSync(file, JSON.stringify(sidebars, null, 2) + '\n');

const cats = withEmoji.filter((i) => i.type === 'category');
const paginas = fs.readdirSync(destino).filter((f) => f.endsWith('.api.mdx')).length;
console.log(`Versão ${version}: ${paginas} endpoints em ${cats.length} categorias.`);
console.log(cats.map((i) => i.label).join(' · '));
const semEmoji = cats.filter((i) => !/^\p{Extended_Pictographic}/u.test(i.label));
if (semEmoji.length) {
  console.warn('Sem emoji (adicione em src/apiTagEmoji.ts):', semEmoji.map((i) => i.label).join(', '));
}
