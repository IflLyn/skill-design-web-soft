# Padrão de landing page

Exemplo no ar: https://lsrastreamento.net.br

Referência de design, lógica e técnicas das páginas geradas por esta skill. Os arquivos citados ficam no site gerado (`site/index.html`, `site/styles.css`, `site/main.js`) e em `scripts/`. As cores da seção 3.1 são um exemplo: o gerador deriva todas a partir de `cores` no `config.json`.

---

## 1. Princípios

1. **Uma ação só.** Todo botão leva ao mesmo lugar (WhatsApp com mensagem pronta). Os botões de cada plano mudam só o texto da mensagem.
2. **Sem build, sem dependências.** HTML, CSS e um JS pequeno e opcional. Sem JS a página continua completa e legível.
3. **Cinema na rolagem.** Cada seção é uma cena com fundo próprio. A página alterna escuro, vídeo, claro e cor da marca, e evita caixas em volta dos textos.
4. **Fatos, não promessas.** Prova social vem de fatos verificáveis (CNPJ, endereço, condições, especificação do produto). Não invente depoimentos nem números.
5. **Movimento com freio.** Toda animação respeita `prefers-reduced-motion`, pausa fora da tela e não economiza à custa da acessibilidade.
6. **A marca vence.** Cores e fontes da marca têm prioridade sobre qualquer guia genérico. O resto (escala, espaçamento, curva de movimento) segue o padrão abaixo.

---

## 2. Processo (skills de apoio)

- `superpowers:brainstorming`: perguntas uma a uma e aprovação do desenho antes de construir.
- `landing-page-design`: estrutura de seções, copy de conversão, escala e movimento.
- `anatomy`: ilustração isométrica em SVG inline para o hero.
- `design-to-motion`: faz a ilustração contar a história do produto em loop.
- `superpowers:verification-before-completion`: nada é dado como pronto sem rodar o `check.mjs` e olhar a página.
- `seo-geo-aeo`: auditoria da URL depois de publicar.

**Perguntas de descoberta que devem ser feitas antes de escrever qualquer coisa:**

- Qual é a única ação da página? (WhatsApp, formulário, compra, agendamento)
- Quem é o público do hero? (o resto aparece mais abaixo)
- Quais são os preços e o que **não** pode aparecer? (taxas, por exemplo, podem ficar só no FAQ)
- Quais fatos podem ser afirmados? (prazos, horário de atendimento, garantias). Nada de "24h" se não for verdade.
- Vocabulário proibido e obrigatório da marca.
- Site de referência visual.
- Domínio, hospedagem e quem tem acesso ao DNS.

---

## 3. Sistema visual

### 3.1 Tokens (`:root`)

```css
:root {
  --fundo: #0B1F3A;          /* base escura da marca */
  --fundo-escuro: #071629;   /* seções de respiro e rodapé */
  --superficie: #10294B;     /* cartões e hover */
  --borda: rgba(255, 255, 255, 0.1);
  --acao: #00A8FF;           /* botões e seção de planos */
  --acao-hover: #33BAFF;
  --detalhe: #00E5FF;        /* destaques, rótulos, onda, rede */
  --texto: #FFFFFF;
  --texto-suave: #B4C2D6;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --titulo: "Sora", system-ui, sans-serif;
  --corpo: "Inter", system-ui, sans-serif;
}
```

Para outra marca, troque só estes valores. Mantenha a lógica de **uma base escura, uma cor de ação e uma cor de detalhe mais luminosa**. Seções claras e coloridas redefinem `--texto-suave` localmente (`.claro`, `.azul`).

### 3.2 Tipografia

- Títulos em fonte geométrica (Sora), corpo em fonte neutra (Inter). Carregue pelo Google Fonts com `preconnect`.
- Escala do Tailwind (16/24, 18/28, 20/28, 24/32, 30/36, 36/40, 48/48, 60/60, 72/72).
- H1: 36 px no celular, 48 px a partir de 640 px e 60 px a partir de 1280 px, com `letter-spacing: -0.02em`. Degradê branco→cinza recortado no texto e a palavra-chave em `--detalhe`.
- Títulos de seção: 36, 48 e 60 px. Frase de impacto: 48, 60 e 72 px.
- `text-wrap: balance` nos títulos e `pretty` nos parágrafos.
- Números grandes (`.num`, 60 px) marcam passos e recursos. No trilho de recursos eles ficam vazados (`-webkit-text-stroke`).
- Rótulo acima do título: 12 px, maiúsculas, `letter-spacing: 0.08em`, na cor de detalhe.

### 3.3 Espaçamento e layout

- Espaçamentos só em múltiplos de 4/8 (4, 8, 12, 16, 24, 32, 48, 64, 96).
- `.wrap` com largura máxima de 1120 px (1280 px a partir de 1280 px de tela) e margem lateral de 16 px (32 px a partir de 960 px).
- Seções: 64 px de padding no celular e 96 px a partir de 960 px. Cenas de vídeo ocupam `min-height: 100svh`.
- Quebras: 640, 960 e 1280 px.
- Duas colunas no computador (`5fr 7fr`): o título fica `sticky` à esquerda e o conteúdo rola à direita (Como funciona e Dúvidas).

### 3.4 Ritmo de fundos (o que deixou o site bonito)

| # | Seção | Fundo | Técnica |
|---|---|---|---|
| 1 | Hero | Vídeo + véu 70 % + rede de pontos | Tela cheia, pilares encaixados no pé |
| 2 | Recursos | `--fundo-escuro` liso | Trilho horizontal preso à tela |
| 3 | Frase | Vídeo + véu + rede | Frase de 72 px com onda ciano |
| 4 | Como funciona | Claro `#F2F6FA` | Linha que se desenha ao rolar |
| 5 | Planos | Cor de ação `--acao` | Faixas largas, preço com onda |
| 6 | Dúvidas | `--fundo` | Linhas finas, abertura suave |
| 7 | CTA final | Vídeo + véu + rede | Repete o CTA do topo |
| 8 | Rodapé | `--fundo-escuro` | Dados da empresa (nome, endereço, telefone) |

Regra: **nunca duas seções seguidas com o mesmo fundo**. A seção clara e a colorida quebram o escuro e fazem cada bloco parecer um capítulo.

### 3.5 Sem caixas

Os textos ficam soltos sobre o fundo, separados por linhas de 1 px (`--borda`) e espaço. As únicas exceções são os cartões de vidro dos pilares do hero, que precisam ler sobre o vídeo.

---

## 4. Componentes

### 4.1 Botão pílula com varredura

- `border-radius: 9999px`, altura mínima de 48 px (40 px no `.btn-sm`).
- `::before` com a cor de varredura em `scaleX(0)`, que vai para 1 no hover; a origem troca de lado para entrar pela esquerda e sair pela direita.
- O hover sobe 2 px e o clique faz `scale(0.97)`.
- `.btn-seta::after { content: "→" }` avança 4 px no hover.
- Cores por variável (`--btn-bg`, `--btn-fg`, `--btn-varre`) para inverter em fundos coloridos (`.azul .btn`).
- **Magnético** (`magnetico()` em `main.js`): os CTAs principais seguem o cursor até 12×8 px usando a propriedade CSS `translate`, que fica livre do `transform` do hover. Só funciona com mouse (`hover: hover` e `pointer: fine`).

### 4.2 Cabeçalho flutuante

- `position: fixed` com margem de 16 px e cantos de 16 px. O vidro (`backdrop-filter: blur(16px)`) fica num `::before`, para o menu em tela cheia não ficar preso dentro da barra.
- Some ao descer e volta ao subir (classe `.recolhido`, com limite de 4 px e só depois de 200 px). Volta também ao receber foco do teclado.
- Links com sublinhado que se desenha da esquerda.
- No celular: menu em painel de altura total, itens em cascata (60 ms cada), fundo `inert`, `Esc` fecha e o foco volta ao botão. Sem JS vira uma lista simples de links.

### 4.3 Hero

- `min-height: 100svh`, para a próxima seção não aparecer na primeira tela.
- Três camadas atrás do conteúdo: vídeo (`z-index: -3`, máscara que esmaece embaixo), véu da cor da marca a 70 % (`-2`) e canvas da rede (`-1`).
- Ordem: selo (pílula com borda) → H1 → subtítulo com o preço "a partir de" → CTA → linha de prova → ilustração ao lado (abaixo no celular).
- Entrada escalonada: cada elemento sobe 6 px e aparece, com 60 ms de diferença.
- Pilares (3 cartões de vidro) no pé do próprio hero.

### 4.4 Trilho horizontal preso (Recursos)

- Celular: `overflow-x: auto` com `scroll-snap`; o cliente arrasta.
- A partir de 960 px (`.fixar`): a seção ganha altura `100vh + distância` e o palco fica `sticky`. A rolagem vertical vira `translate3d` horizontal do trilho e uma barra de progresso mostra `--r`.
- A distância é calculada até o **último item** encostar na margem direita, com a mesma folga da esquerda:
  `ultimo.right - (innerWidth - paddingLeft)`.

### 4.5 Frase de impacto com onda

- Texto centralizado, 72 px no computador, sobre vídeo.
- Revelação palavra por palavra: o JS quebra o texto em `<span class="w">` e cada palavra acende ao cruzar 35 % da base da tela. Um `<span class="sr">` guarda o texto inteiro para leitores de tela, e a versão visual fica com `aria-hidden`.
- **Onda ciano**: degradê branco → ciano → branco com 250 % de largura, recortado no texto (`background-clip: text`) e animado em `background-position`:

```css
.frase {
  background: linear-gradient(100deg, #FFF 0%, #FFF 38%, #00E5FF 46%, #7FF3FF 50%, #00E5FF 54%, #FFF 62%, #FFF 100%) 100% 0 / 250% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: onda 3s ease-in-out infinite;
}
@keyframes onda { from { background-position: 100% 0; } to { background-position: 0% 0; } }
```

A mesma onda funciona sobre outra cor base: nos preços, a base é o azul escuro e o brilho é `#5CF0FF`/`#E6FDFF` (ciano puro some sobre o azul). As linhas entram em cascata com 150 ms de atraso cada.

### 4.6 Passos com linha que se desenha

Uma linha cinza de 2 px fica à esquerda da lista, e uma linha da cor de ação por cima cresce com `scaleY(var(--l))` conforme a lista passa por 60 % da tela.

### 4.7 Tabela de planos

- `<table>` de verdade (é bom para SEO e leitores de tela), exibida como faixas em grid. O `thead` fica visualmente oculto.
- Cada linha tem nome, preço grande com onda e um botão com a mensagem do plano. No hover o nome anda 8 px.
- Uma nota curta abaixo com formas de pagamento e condições.

### 4.8 FAQ com abertura suave

- `<details>`/`<summary>` nativos (funcionam sem JS), separados só por linhas. O "+" gira 135° e vira "×".
- O JS (`duvidas()`) intercepta o clique e anima a `height` com a Web Animations API (500 ms, `--ease`). Ao abrir, o texto entra com fade e 8 px de subida. Ao fechar, a classe `.fechando` gira o ícone de volta antes do `open = false`.
- Respostas de 40 a 60 palavras, que começam respondendo direto (bom para snippets e respostas de IA).

### 4.9 Botão flutuante de WhatsApp

Botão redondo de 56 px com `safe-area-inset-bottom`. Ele fica oculto enquanto o CTA do hero está à vista, para não cobrir a ilustração no celular.

---

## 5. Motor de rolagem (`rolagem()` em `main.js`)

Um único listener de `scroll` (`passive`) agenda **um** `requestAnimationFrame`. Cada quadro calcula propriedades CSS pela posição na tela, e o CSS faz o resto:

| Variável | Onde | Cálculo | Efeito |
|---|---|---|---|
| `--p` | `.painel` | `(vh - top) / (vh * 0.7)` | `clip-path: inset(0 (1-p)*48px round (1-p)*32px)`: o painel entra com margens e cantos e cresce até a largura toda |
| `--z` | `.cena` | `(vh - top) / (vh + altura)` | A mídia vai de `scale(1.15)` a `scale(1)`, como se a câmera recuasse |
| `--l` | `.passos` | `(vh*0.6 - top) / altura` | A linha dos passos se desenha |
| `--r` | trilho | `-top / distância` | Progresso do trilho preso |

Todas as variáveis têm valor padrão 1 no CSS (`var(--p, 1)`), então sem JS ou com movimento reduzido tudo aparece no estado final.

Revelações simples (`.reveal`) usam `IntersectionObserver` uma única vez (`uma_vez()`): o elemento sobe 32 px e aparece em 700 ms. A classe só esconde algo quando `<html class="js">` existe, e essa classe é posta por um script inline e removida no `onerror` do `main.js`.

---

## 6. Fundo de rede de pontos (`rede()`)

Um canvas em cada seção com vídeo (hero, frase, CTA):

- A quantidade de pontos é `área / 15000`, limitada entre 28 e 110. Cada ponto anda de 6 a 16 px por segundo e quica nas bordas. 20 % dos pontos são maiores.
- Pontos a até 150 px se ligam com uma linha `rgba(0,168,255, 0.28*(1-d/150))`.
- O cursor liga os pontos a até 200 px com linhas de detalhe mais fortes.
- `devicePixelRatio` é limitado a 2 e o passo de tempo a 50 ms (aba voltando do fundo não "teleporta" os pontos).
- No celular, quando muda só a altura (a barra de endereço), o canvas não sorteia os pontos de novo.
- Fica pausado fora da tela (`IntersectionObserver`). Com movimento reduzido desenha um quadro estático.

Para outra marca, troque as duas cores `rgba` e talvez `LIGA`/`CURSOR`.

---

## 7. Vídeo de fundo

- **Montagem** (`scripts/video.sh`, ffmpeg): três tomadas são unidas com `xfade` de 1,5 s. O arquivo começa 1,5 s depois do início de A e termina na fusão de C de volta para A, então o `loop` não tem emenda: `A(1,5–10) → B → C → A(0–1,5)`.
- Duas versões: paisagem 1280×720 e retrato 720×1280 (recorte central), H.264 com `crf 30`, sem áudio, `+faststart`. Cada uma fica com cerca de 2 MB e um pôster `.jpg` do primeiro quadro.
- No HTML:

```html
<video class="cena-midia cena-video" muted loop playsinline preload="none"
       poster="video/hero-paisagem.jpg" data-inicio="17" aria-hidden="true">
  <source src="video/hero-retrato.mp4" media="(orientation: portrait)" type="video/mp4">
  <source src="video/hero-paisagem.mp4" type="video/mp4">
</video>
```

- O JS (`videos()`) só carrega e toca quando a cena se aproxima da tela (`rootMargin: 200px`) e pausa ao sair. Ele não toca com movimento reduzido nem com economia de dados (`navigator.connection.saveData`), e troca o pôster para retrato no celular. `data-inicio` faz cada cena começar num trecho diferente do mesmo arquivo: um vídeo serve a página inteira.
- Fontes de vídeo: bancos gratuitos (Pexels). Guarde os IDs no `build.sh` para gerar de novo.

---

## 8. Ilustração do hero

- Gere com a skill `anatomy` como SVG inline (sem requisição extra). A animação fica no próprio SVG ou é pedida à `design-to-motion`.
- Desenhe a jornada do produto em 3 ou 4 objetos ligados por rotas (ex.: pedido → cozinha → moto → cliente).
- Comece depois da entrada do hero (cerca de 1,2 s), pause fora da tela e não anime com movimento reduzido.

---

## 9. Robustez e acessibilidade

- Sem JS: conteúdo inteiro visível, menu em linhas, FAQ nativo. O JS falhando remove a classe `js`.
- Cada recurso do `main.js` roda num `try` próprio, então um que quebre não derruba os outros.
- Link "Pular para o conteúdo", `:focus-visible` com contorno de 2 px de detalhe, `aria-labelledby` em cada seção, um único H1.
- Vídeos e canvas com `aria-hidden`. A frase animada tem uma cópia para leitores de tela.
- `prefers-reduced-motion`: zera transições e animações, mostra as revelações, não toca vídeo nem rede animada e não prende o trilho.
- Sem rolagem horizontal em 360 px (conferido no navegador).

---

## 10. SEO, GEO e AEO

- `title` de 30 a 60 caracteres no formato "Serviço + cidade | Marca". `meta description` de 120 a 160 caracteres com preço e CTA.
- `canonical`, Open Graph e Twitter Card com `og-image.png` de 1200×630 gerada por script (`imagens.py`, Pillow), `lang="pt-BR"` e `theme-color`.
- JSON-LD inline em `@graph`: `LocalBusiness` (com `taxID`, endereço, telefone, `areaServed`, `priceRange` e `makesOffer` com um `Offer` por plano), `FAQPage` (as mesmas perguntas da página) e `HowTo` (os passos).
- `llms.txt` com um resumo factual (empresa, planos, como funciona, links) para buscadores com IA. Também `robots.txt` e `sitemap.xml`.
- Nome, endereço e telefone idênticos no rodapé, no JSON-LD e no Perfil da Empresa no Google.
- Depois de publicar: Search Console, Bing Webmaster, Rich Results Test e auditoria `seo-geo-aeo`.

---

## 11. Regras de texto

- Frases curtas e afirmações verificáveis. Tom tecnológico e premium.
- Sem hífen entre letras e sem travessão no texto visível (o `check.mjs` barra os dois).
- Vocabulário da marca conferido por script (`proibidas` no `config.json`).
- Preço sempre como "a partir de" no hero e completo na tabela. Valores sensíveis (taxas) só no FAQ, se o dono quiser.
- Cada botão de plano leva uma mensagem própria e codificada na URL: `https://wa.me/55DDDNUMERO?text=Ol%C3%A1!%20Quero%20o%20plano%20...`.

---

## 12. Verificação automática (`scripts/check.mjs`)

`node scripts/check.mjs config.json .` deve imprimir `ok` antes de cada publicação. Ele confere:

- um único `<h1>`;
- JSON-LD válido, com `LocalBusiness`, `FAQPage` e `HowTo`;
- tamanhos de `title` e description;
- `canonical` e `og:image`;
- todos os links `wa.me` com o número certo;
- as regras de texto, em todas as páginas.

O número e as palavras proibidas vêm do `config.json`.

---

## 13. Publicação (Cloudflare Pages)

1. Criar o projeto (uma vez): `npx wrangler pages project create NOME --production-branch main --force`. O `--force` existe porque o wrangler 4 tenta criar um Worker.
2. Publicar: `npx wrangler pages deploy site --project-name NOME --branch main` (no PowerShell, `npx.cmd`).
3. DNS: os nameservers do domínio vão para a Cloudflare. Crie CNAME `@` e `www` → `NOME.pages.dev` (proxied) e ligue os dois em Custom domains.
4. Faça uma Redirect Rule de `www` para a raiz (301, mantendo a query) e ligue Always Use HTTPS. Depois ative o HSTS com `max-age` curto.
5. Coloque no `_headers` `nosniff`, `Referrer-Policy`, `Permissions-Policy` e `X-Frame-Options: DENY`. Para CSP, libere os scripts inline por hash.
6. O Pages serve `404.html` sozinho e tira o `.html` das URLs (redireciona com 308).
7. Ao trocar nameservers, recrie os registros de e-mail (MX, SPF e DKIM do provedor) **antes** da troca e preserve os subdomínios que apontam para servidores próprios.

---

## 14. Checklist para um novo site

- [ ] Descoberta respondida (seção 2) e spec aprovada
- [ ] Preencher o `config.json` com marca, cores, fontes e logo
- [ ] Escrever o hero: selo, H1 com palavra destacada, subtítulo com preço, CTA e prova
- [ ] Definir o ritmo de fundos (3.4) sem repetir fundo vizinho
- [ ] Gravar ou baixar 3 tomadas e rodar o `video.sh`
- [ ] Ilustração do produto com `anatomy` (opcional, mas eleva muito o hero)
- [ ] Recursos (6 itens), frase de impacto, 3 passos, planos, 6 a 8 dúvidas e CTA final
- [ ] Rodar `imagens.py`, `gerar.mjs` e `check.mjs`
- [ ] Testar em 1920, 1440, 390 e 360 px, com e sem JS e com movimento reduzido
- [ ] Publicar, ligar o domínio, HTTPS e `www` → raiz
- [ ] Search Console, Bing, Perfil da Empresa e auditoria `seo-geo-aeo`
