---
name: skill-design-web-soft
description: Cria landing pages de vendas com visual cinematográfico: fundo escuro, vídeo em tela cheia, rede de pontos que reage ao mouse, rolagem cena a cena, onda de cor nos títulos e preços, tudo em HTML, CSS e JS puros, sem build. Use sempre que o usuário pedir uma landing page, página de vendas ou site de uma página para qualquer serviço, produto ou empresa, mesmo sem citar esta skill. Tem prioridade sobre landing-page-design ao criar uma página nova; aquela skill continua útil para revisar copy.
---

# Design web soft

Exemplo no ar: https://lsrastreamento.net.br

Um gerador monta o site a partir de um `config.json`. O desenho já está pronto e decidido: seu trabalho é entender o negócio, escrever bem o texto e conseguir boa mídia. Não redesenhe seções nem reescreva CSS, a menos que o usuário peça; o valor deste padrão é sair sempre com a mesma qualidade.

## 1. Descoberta

Pergunte uma coisa por vez, só o que ainda não estiver claro:

- Marca, domínio, WhatsApp com DDD, cidade e área de atendimento.
- O que vende e para quem é o hero.
- Preços, e o que **não** deve aparecer na página.
- Fatos que podem ser afirmados: prazos, horários, garantias, CNPJ, endereço.
- Cores da marca (fundo escuro, ação, detalhe luminoso), logo branca e símbolo, se houver.
- Palavras proibidas e obrigatórias.
- Vídeos: o usuário tem três tomadas, ou devo sugerir buscas em bancos gratuitos como o Pexels?

Nunca invente depoimentos, números, CNPJ, endereço ou promessas: uma página de vendas com fato falso prejudica a empresa real. Se faltar um dado, pergunte; se ele for opcional, omita o campo.

## 2. Configuração

Copie `modelo/exemplo.config.json` para a pasta do projeto como `config.json` e preencha. Pontos que costumam dar erro:

- `h1`: uma linha por item; `*palavra*` ganha a cor de detalhe.
- `cores.fundo` precisa ser escuro, e `cores.acao` precisa de contraste com ele, porque botões e a seção de planos usam texto escuro sobre a ação. O gerador avisa se não houver.
- `planos` pode sair inteiro quando não houver tabela de preços: a seção e o item do menu somem. `periodo` vazio serve para venda única.
- `recursos`: 6 itens funcionam melhor. `pilares`: 3. `duvidas`: 6 a 8, com respostas de 40 a 60 palavras que começam respondendo direto.
- Ícones de `pilares`: chip, celular, pino, escudo, relogio, estrela, caixa, coracao.
- `title` com 30 a 60 caracteres e `description` com 120 a 160.
- Texto sem hífen entre letras e sem travessão (`permitirHifen` libera exceções além de e-mail e Wi-Fi).

## 3. Gerar

`<skill>` é a pasta desta skill.

```bash
python <skill>/scripts/imagens.py config.json .
node <skill>/scripts/gerar.mjs config.json .
node <skill>/scripts/check.mjs config.json .
```

`check.mjs` deve imprimir `ok`. Trate os avisos de `gerar.mjs` em vez de ignorá-los. O logo e o símbolo são caminhos relativos ao `config.json`.

## 4. Mídia

- **Vídeo:** com as três tomadas, rode `FFMPEG=ffmpeg sh <skill>/scripts/video.sh A.mp4 B.mp4 C.mp4 .` e coloque `"video": true`. Sem vídeo, o site funciona com fundo liso e rede de pontos, mas perde boa parte do impacto: avise o usuário.
- **Ilustração do hero (opcional):** gere com a skill `anatomy` e aponte `visual` para o `.svg` ou para uma imagem. Sem `visual`, o hero fica só com texto.

## 5. Conferir

Sirva `site/` por um servidor local e abra no navegador. Confira em 1920, 1440, 390 e 360 px:

- sem rolagem horizontal, e o hero não deixa a próxima seção vazar;
- menu do celular, FAQ abrindo suave, botões e links do WhatsApp;
- trilho de recursos preso à tela e chegando até o último item;
- console sem erros.

Olhe a página de verdade antes de dizer que está pronta.

## 6. Publicar

Só publique ou mexa em DNS com a aprovação do usuário. Logins e tokens são feitos por ele. O passo a passo da Cloudflare está em `references/padrao.md`, seção 13. Antes de trocar nameservers, copie os registros de e-mail existentes.

## Referência

`references/padrao.md` explica cada componente e técnica. Leia a seção correspondente quando o usuário pedir uma mudança de design ou uma seção nova.

Cores, fontes e dados da empresa ficam no `config.json`. Rodar `gerar.mjs` de novo sobrescreve `site/`, inclusive `styles.css`. Para um ajuste manual de layout, faça a edição em `site/` e, a partir daí, altere o projeto direto em vez de gerar de novo.
