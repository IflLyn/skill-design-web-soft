// Monta o site a partir de um config.json. Uso: node gerar.mjs <config.json> <pasta-do-projeto>
// Grava em <pasta>/site; não apaga nada, então img/ e video/ continuam lá. Pode rodar de novo à vontade.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname, basename, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [arqConfig, projeto] = process.argv.slice(2);
if (!arqConfig || !projeto) { console.error('uso: node gerar.mjs <config.json> <pasta-do-projeto>'); process.exit(1); }
const c = JSON.parse(readFileSync(arqConfig, 'utf8'));
const baseConfig = dirname(resolve(arqConfig));
const modelo = join(dirname(fileURLToPath(import.meta.url)), '..', 'modelo');
const site = join(projeto, 'site');
mkdirSync(join(site, 'img'), { recursive: true });

// ---- cores: tudo deriva de fundo, ação e detalhe
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (a) => '#' + a.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const mistura = (h, outra, t) => hex(rgb(h).map((v, i) => v + (rgb(outra)[i] - v) * t));
const lum = (h) => { const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const { fundo, acao, detalhe } = c.cores;
const B = '#FFFFFF', P = '#000000';
const cores = {
  FUNDO: fundo, FUNDO_ESCURO: mistura(fundo, P, 0.36), SUPERFICIE: mistura(fundo, B, 0.04),
  ACAO: acao, ACAO_HOVER: mistura(acao, B, 0.2), ACAO_ESCURA: mistura(acao, P, 0.37),
  DETALHE: detalhe, DETALHE_CLARO: mistura(detalhe, B, 0.5), ONDA_1: mistura(detalhe, B, 0.36), ONDA_2: mistura(detalhe, B, 0.9),
  TEXTO_SUAVE: mistura(B, fundo, 0.25), CLARO: mistura(B, fundo, 0.05), CLARO_SUAVE: mistura(fundo, B, 0.25),
};
for (const k of ['FUNDO', 'FUNDO_ESCURO', 'SUPERFICIE', 'ACAO', 'DETALHE']) cores[k + '_RGB'] = rgb(cores[k]).join(', ');
const avisos = [];
if (contraste(fundo, B) < 7) avisos.push(`fundo claro demais para texto branco (contraste ${contraste(fundo, B).toFixed(1)}; o desenho pede base escura)`);
if (contraste(acao, fundo) < 4.5) avisos.push(`texto escuro sobre a cor de ação com contraste ${contraste(acao, fundo).toFixed(1)} (mínimo 4,5): clareie a ação`);
if (contraste(detalhe, fundo) < 4.5) avisos.push(`detalhe sobre o fundo com contraste ${contraste(detalhe, fundo).toFixed(1)} (mínimo 4,5)`);

const fonteTitulo = c.fontes?.titulo ?? 'Sora', fonteCorpo = c.fontes?.corpo ?? 'Inter';
const preencher = (txt) => txt.replace(/\{\{(\w+)\}\}/g, (m, k) => ({ ...cores, FONTE_TITULO: fonteTitulo, FONTE_CORPO: fonteCorpo })[k] ?? m);
for (const f of ['styles.css', 'main.js']) writeFileSync(join(site, f), preencher(readFileSync(join(modelo, f), 'utf8')));
writeFileSync(join(site, '_headers'), readFileSync(join(modelo, '_headers')));

// ---- ajudantes
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = `https://${c.dominio}`;
const wa = (msg) => `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(msg)}`;
const waPadrao = wa(c.mensagem);
const n2 = (i) => String(i + 1).padStart(2, '0');
const ico = (d) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${d}</svg>`;
const ICONES = {
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  celular: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
  pino: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  escudo: '<path d="M12 3l7 3v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  estrela: '<path d="m12 3 2.7 5.8 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3.1 1.2-6.2L3 9.6l6.3-.8L12 3Z"/>',
  caixa: '<path d="m3 8 9-5 9 5v8l-9 5-9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  coracao: '<path d="M12 20s-8-4.8-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.2 12 20 12 20Z"/>',
};
const icoWa = ico('<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path d="M9 8.5c0 3.6 2.9 6.5 6.5 6.5l1-1.6-2-1-1 1a4 4 0 0 1-2.4-2.4l1-1-1-2Z"/>');
const e = c.empresa;

// logo em arquivo, ou o nome em texto
let logoHtml = () => `<span class="marca-texto">${esc(c.marca)}</span>`;
if (c.logo) {
  const nome = 'logo' + extname(c.logo);
  copyFileSync(resolve(baseConfig, c.logo), join(site, 'img', nome));
  logoHtml = (w, h, raiz = '') => `<img src="${raiz}img/${nome}" alt="${esc(c.marca)}" width="${w}" height="${h}">`;
}

const video = (classe, inicio) => c.video ? `<video class="${classe} cena-video" muted loop playsinline preload="none" poster="video/hero-paisagem.jpg"${inicio ? ` data-inicio="${inicio}"` : ''} aria-hidden="true">
      <source src="video/hero-retrato.mp4" type="video/mp4" media="(orientation: portrait)">
      <source src="video/hero-paisagem.mp4" type="video/mp4">
    </video>` : '';
const rede = '<canvas class="rede" aria-hidden="true"></canvas>';

let visual = '';
if (c.visual) {
  const v = resolve(baseConfig, c.visual);
  if (extname(v) === '.svg') visual = readFileSync(v, 'utf8');
  else { copyFileSync(v, join(site, 'img', basename(v))); visual = `<img src="img/${basename(v)}" alt="${esc(c.visualAlt ?? '')}">`; }
}

const head = (titulo, desc, extra, raiz) => `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
${extra}
<meta name="theme-color" content="${fundo}">
<link rel="icon" type="image/png" href="${raiz}img/favicon.png">
<link rel="apple-touch-icon" href="${raiz}img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${fonteCorpo.replace(/ /g, '+')}:wght@400;500;600&family=${fonteTitulo.replace(/ /g, '+')}:wght@600;700&display=swap">
<link rel="stylesheet" href="${raiz}styles.css">`;

const linhasEndereco = [e.endereco, [e.cidadeUf, e.cep].filter(Boolean).join(', ')].filter(Boolean);
const mapa = linhasEndereco.length ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(linhasEndereco.join(', '))}` : '';
const rodape = (raiz) => `<footer class="rodape">
  <div class="wrap rodape-grid">
    <div>
      ${logoHtml(135, 40, raiz)}
      <p>${esc(c.rodape)}</p>
    </div>
    <address>
      ${[`<strong>${esc(c.marca)}</strong>`, e.cnpj && `CNPJ ${esc(e.cnpj)}`, ...linhasEndereco.map(esc), `WhatsApp <a href="${esc(waPadrao)}">${esc(c.whatsappTexto)}</a>`, e.horario && esc(e.horario)].filter(Boolean).join('<br>\n      ')}
    </address>
    <ul class="rodape-links">
      ${[mapa && `<li><a href="${esc(mapa)}">Como chegar</a></li>`, ...(c.links ?? []).map((l) => `<li><a href="${esc(l.url)}">${esc(l.rotulo)}</a></li>`), `<li><a href="${raiz}privacidade.html">Privacidade</a></li>`].filter(Boolean).join('\n      ')}
    </ul>
  </div>
  <p class="wrap rodape-fim">© ${new Date().getFullYear()} ${esc(c.marca)}</p>
</footer>`;

const topoSimples = `<header class="topo">
  <div class="topo-bar">
    <a class="marca" href="/" aria-label="${esc(c.marca)}, início">${logoHtml(108, 32, '/')}</a>
  </div>
</header>`;

// ---- dados estruturados
const preco = (p) => p.preco.replace(/[^\d,.]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.');
const planos = c.planos?.itens ?? [];
const mensal = /m[êe]s/.test(c.planos?.periodo ?? '');
const empresaLd = {
  '@type': c.tipoSchema ?? 'LocalBusiness', '@id': `${url}/#empresa`, name: c.marca, url: `${url}/`,
  image: `${url}/img/og-image.png`, description: c.descricao, telephone: `+${c.whatsapp}`,
  ...(e.cnpj && { taxID: e.cnpj }),
  ...(e.endereco && { address: { '@type': 'PostalAddress', streetAddress: e.endereco, addressLocality: e.cidade, addressRegion: e.uf, postalCode: e.cep, addressCountry: 'BR' } }),
  ...(c.areaAtendida && { areaServed: c.areaAtendida }),
  ...(planos.length && {
    priceRange: planos.length > 1 ? `${planos[0].preco} a ${planos.at(-1).preco}` : planos[0].preco,
    makesOffer: planos.map((p) => ({
      '@type': 'Offer', name: p.nome, price: preco(p), priceCurrency: 'BRL', ...(p.descricao && { description: p.descricao }),
      ...(mensal && { priceSpecification: [{ '@type': 'UnitPriceSpecification', price: preco(p), priceCurrency: 'BRL', unitCode: 'MON' }] }),
    })),
  }),
};
const ld = { '@context': 'https://schema.org', '@graph': [
  empresaLd,
  { '@type': 'FAQPage', mainEntity: c.duvidas.itens.map((d) => ({ '@type': 'Question', name: d.p, acceptedAnswer: { '@type': 'Answer', text: d.r } })) },
  { '@type': 'HowTo', name: c.passos.nomeSchema ?? `Como contratar ${c.marca}`, step: c.passos.itens.map((p, i) => ({ '@type': 'HowToStep', position: i + 1, name: p.titulo, text: p.texto })) },
] };

const h1 = c.h1.map(esc).map((l) => l.replace(/\*(.+?)\*/g, '<span class="destaque">$1</span>')).join('<br> ');
const titulo = c.seo.title, desc = c.seo.description, ogDesc = c.seo.ogDescription ?? desc;
const menu = [['recursos', 'Recursos'], ['como-funciona', 'Como funciona'], ...(planos.length ? [['planos', c.planos.rotulo ?? 'Planos']] : []), ['duvidas', 'Dúvidas']];

const index = `${head(titulo, desc, `<link rel="canonical" href="${url}/">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${esc(c.marca)}">
<meta property="og:url" content="${url}/">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(ogDesc)}">
<meta property="og:image" content="${url}/img/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(titulo)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(titulo)}">
<meta name="twitter:description" content="${esc(ogDesc)}">
<meta name="twitter:image" content="${url}/img/og-image.png">
<meta name="twitter:image:alt" content="${esc(titulo)}">`, '')}
<script>document.documentElement.classList.add('js')</script>
<script src="main.js" defer onerror="document.documentElement.classList.remove('js')"></script>
<script type="application/ld+json">
${JSON.stringify(ld, null, 1).replace(/</g, '\\u003c')}
</script>
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>

<header class="topo">
  <div class="topo-bar">
    <a class="marca" href="#inicio" aria-label="${esc(c.marca)}, início">${logoHtml(108, 32)}</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" aria-label="Abrir menu">
      <span></span><span></span>
    </button>
    <nav class="menu" id="menu" aria-label="Principal">
      <ul>
        ${[...menu.map(([id, r]) => `<li><a href="#${id}">${r}</a></li>`), ...(c.links ?? []).map((l) => `<li><a href="${esc(l.url)}">${esc(l.rotulo)}</a></li>`)].join('\n        ')}
      </ul>
      <a class="btn btn-sm" href="${esc(waPadrao)}">WhatsApp</a>
    </nav>
  </div>
</header>

<main id="conteudo" tabindex="-1">
  <section class="hero" id="inicio" aria-labelledby="titulo">
    ${video('hero-video')}
    ${rede}
    <div class="wrap hero-grid${visual ? '' : ' so-texto'}">
      <div class="hero-texto">
        <p class="selo">${esc(c.selo)}</p>
        <h1 id="titulo">${h1}</h1>
        <p class="sub">${esc(c.sub)}</p>
        <a class="btn btn-wa btn-seta" href="${esc(waPadrao)}">
          ${icoWa}
          ${esc(c.cta)}
        </a>
        <p class="prova">${esc(c.prova)}</p>
      </div>
      ${visual ? `<div class="hero-visual" id="ilustracao">${visual}</div>` : ''}
    </div>
    <section class="pilares" aria-label="O que você recebe">
      <ul class="wrap pilares-lista">
        ${c.pilares.map((p) => `<li>
          ${ico(ICONES[p.icone] ?? ICONES.estrela)}
          <div><h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p></div>
        </li>`).join('\n        ')}
      </ul>
    </section>
  </section>

  <section class="recursos-secao" id="recursos" aria-labelledby="recursos-titulo">
    <div class="recursos-palco">
      <div class="wrap cabeca reveal">
        <p class="rotulo">Recursos</p>
        <h2 id="recursos-titulo">${esc(c.recursos.titulo)}</h2>
      </div>
      <div class="recursos-janela">
        <ul class="recursos-trilho">
          ${c.recursos.itens.map((r, i) => `<li><span class="num" aria-hidden="true">${n2(i)}</span><p class="rotulo">${esc(r.rotulo)}</p><h3>${esc(r.titulo)}</h3><p>${esc(r.texto)}</p></li>`).join('\n          ')}
        </ul>
      </div>
      <div class="wrap"><div class="recursos-progresso" aria-hidden="true"></div></div>
    </div>
  </section>

  <section class="cena painel frase-secao" aria-label="Resumo">
    ${video('cena-midia', c.videoInicioFrase ?? 17)}
    ${rede}
    <div class="wrap">
      <p id="frase" class="frase">${esc(c.frase)}</p>
    </div>
  </section>

  <section class="secao painel claro" id="como-funciona" aria-labelledby="como-titulo">
    <div class="wrap duas-colunas">
      <div class="cabeca reveal">
        <p class="rotulo">Como funciona</p>
        <h2 id="como-titulo">${esc(c.passos.titulo)}</h2>
      </div>
      <ol class="passos">
        ${c.passos.itens.map((p, i) => `<li><span class="num" aria-hidden="true">${n2(i)}</span><div><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p></div></li>`).join('\n        ')}
      </ol>
    </div>
  </section>
${planos.length ? `
  <section class="secao painel azul" id="planos" aria-labelledby="planos-titulo">
    <div class="wrap">
      <div class="cabeca reveal">
        <p class="rotulo">${esc(c.planos.rotulo ?? 'Planos')}</p>
        <h2 id="planos-titulo">${esc(c.planos.titulo)}</h2>
      </div>
      <table class="tabela">
        <caption class="sr">${esc(c.planos.titulo)}</caption>
        <thead>
          <tr><th scope="col">${esc(c.planos.colunaNome ?? 'Plano')}</th><th scope="col">${esc(c.planos.colunaPreco ?? 'Preço')}</th><th scope="col"><span class="sr">Contratar</span></th></tr>
        </thead>
        <tbody>
          ${planos.map((p) => `<tr><th scope="row">${esc(p.nome)}</th><td data-label="${esc(c.planos.colunaPreco ?? 'Preço')}"><span><strong>${esc(p.preco)}</strong>${esc(c.planos.periodo ?? '')}</span></td><td><a class="btn btn-sm btn-seta" href="${esc(wa(p.mensagem))}">${esc(c.planos.botao ?? 'Quero este plano')}</a></td></tr>`).join('\n          ')}
        </tbody>
      </table>
      ${c.planos.nota ? `<p class="nota">${esc(c.planos.nota)}</p>` : ''}
    </div>
  </section>
` : ''}
  <section class="secao painel" id="duvidas" aria-labelledby="duvidas-titulo">
    <div class="wrap duas-colunas">
      <div class="cabeca reveal">
        <p class="rotulo">Dúvidas</p>
        <h2 id="duvidas-titulo">${esc(c.duvidas.titulo)}</h2>
      </div>
      <div class="faq">
        ${c.duvidas.itens.map((d) => `<details><summary><h3>${esc(d.p)}</h3></summary><p>${esc(d.r)}</p></details>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="cena painel cta-final" aria-labelledby="cta-titulo">
    ${video('cena-midia', c.videoInicioFinal ?? 9)}
    ${rede}
    <div class="wrap">
      <h2 id="cta-titulo">${esc(c.final.titulo)}</h2>
      <p class="sub">${esc(c.final.sub)}</p>
      <a class="btn btn-wa btn-seta" href="${esc(waPadrao)}">
        ${icoWa}
        ${esc(c.cta)}
      </a>
      <p class="prova">${esc(c.prova)}</p>
    </div>
  </section>
</main>

${rodape('')}

<a class="wa-flutuante" href="${esc(waPadrao)}" aria-label="Falar com ${esc(c.marca)} no WhatsApp">
  ${icoWa}
</a>
</body>
</html>
`;
writeFileSync(join(site, 'index.html'), index);

const hoje = new Date().toISOString().slice(0, 10);
const dataPt = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
writeFileSync(join(site, 'privacidade.html'), `${head(`Privacidade | ${c.marca}`, `Aviso de privacidade de ${c.marca}: o site não usa cookies nem formulários, e os dados enviados pelo WhatsApp servem só para atender seu pedido.`, `<link rel="canonical" href="${url}/privacidade">`, '/')}
</head>
<body>
${topoSimples}

<main id="conteudo">
  <div class="wrap pagina">
    <p class="rotulo">Privacidade</p>
    <h1>Aviso de privacidade</h1>
    <p>Atualizada em ${dataPt}.</p>

    <h2>Quem somos</h2>
    <p>${esc([c.marca, e.cnpj && `CNPJ ${e.cnpj}`, ...linhasEndereco].filter(Boolean).join(', '))}. Somos a empresa responsável pelos dados tratados a partir deste site.</p>

    <h2>O que este site coleta</h2>
    <p>Este site não usa cookies, não tem formulários e não tem ferramentas de análise ou publicidade. Não guardamos dados de quem apenas visita as páginas.</p>
    <p>As fontes de texto são carregadas dos servidores do Google Fonts. Ao abrir uma página, o seu navegador se conecta ao Google para obter as fontes, e o Google pode registrar o endereço IP.</p>
    <p>O site é hospedado na Cloudflare, que processa dados técnicos de acesso, como o endereço IP, para entregar e proteger o site.</p>

    <h2>Contato pelo WhatsApp</h2>
    <p>O contato com ${esc(c.marca)} é feito pelo WhatsApp. Os dados que você enviar na conversa são usados apenas para atender o seu pedido. Não vendemos nem compartilhamos esses dados para fins de publicidade.</p>

    <h2>Seus direitos</h2>
    <p>Pela Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode pedir:</p>
    <ul>
      <li>acesso aos seus dados;</li>
      <li>correção de dados incorretos;</li>
      <li>exclusão dos dados, quando não houver obrigação legal de manter os dados.</li>
    </ul>
    <p>Para fazer o pedido, chame a gente no WhatsApp pelo número ${esc(c.whatsappTexto)}.</p>
    <a class="btn" href="${esc(waPadrao)}">Falar no WhatsApp</a>
    <a class="btn btn-sec" href="/">Voltar ao início</a>
  </div>
</main>

${rodape('/')}
</body>
</html>
`);

writeFileSync(join(site, '404.html'), `${head(`Página não encontrada | ${c.marca}`, `Página não encontrada. Volte ao início de ${c.marca} ou fale com a gente no WhatsApp.`, '<meta name="robots" content="noindex">', '/')}
</head>
<body>
${topoSimples}

<main id="conteudo">
  <div class="wrap pagina pagina-404">
    <div>
      <p class="rotulo">Erro 404</p>
      <h1>Página não encontrada</h1>
      <p>O endereço que você abriu não existe ou foi trocado.</p>
      <a class="btn" href="/">Voltar ao início</a>
      <a class="btn btn-sec" href="${esc(waPadrao)}">Falar no WhatsApp</a>
    </div>
  </div>
</main>

${rodape('/')}
</body>
</html>
`);

writeFileSync(join(site, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`);
writeFileSync(join(site, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${url}/</loc><lastmod>${hoje}</lastmod></url>
  <url><loc>${url}/privacidade</loc><lastmod>${hoje}</lastmod></url>
</urlset>
`);
writeFileSync(join(site, 'llms.txt'), `# ${c.marca}

> ${c.descricao}

${[e.cnpj && `CNPJ ${e.cnpj}`, ...linhasEndereco, e.horario, `WhatsApp ${c.whatsappTexto}`].filter(Boolean).join('. ')}.
${planos.length ? `
## ${c.planos.rotulo ?? 'Planos'}

${planos.map((p) => `- ${p.nome}: ${p.preco}${c.planos.periodo ?? ''}`).join('\n')}
${c.planos.nota ? `\n${c.planos.nota}\n` : ''}` : ''}
## Como funciona

${c.passos.itens.map((p) => `- ${p.titulo}: ${p.texto}`).join('\n')}

## Links

- [Página inicial](${url}/)
- [Privacidade](${url}/privacidade)
- [WhatsApp](https://wa.me/${c.whatsapp})
`);

for (const f of ['favicon.png', 'apple-touch-icon.png', 'og-image.png'])
  if (!existsSync(join(site, 'img', f))) avisos.push(`falta img/${f}: rode imagens.py`);
if (c.video && !existsSync(join(site, 'video', 'hero-paisagem.mp4'))) avisos.push('video: true, mas falta site/video/hero-paisagem.mp4: rode video.sh');
for (const a of avisos) console.warn('aviso: ' + a);
console.log('site gerado em ' + site);
