// Confere o site gerado. Uso: node check.mjs <config.json> <pasta-do-projeto>
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const [arqConfig, projeto] = process.argv.slice(2);
const c = JSON.parse(readFileSync(arqConfig, 'utf8'));
const dir = join(projeto, 'site');
const fails = [];
const fail = (file, msg) => fails.push(`${file}: ${msg}`);
const permitidos = ['e-mail', 'Wi-Fi', ...(c.permitirHifen ?? [])];

// texto visível: sem script, style, comentários, tags e atributos
const visible = (html) =>
  html.replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]*>/g, ' ').replace(/&(ndash|mdash|#8211|#8212);/g, '–');

function textRules(file, html) {
  let t = visible(html);
  for (const p of permitidos) t = t.replaceAll(p, ' ');
  if (/\p{L}-\p{L}/u.test(t)) fail(file, `hífen entre letras: "${t.match(/\S*\p{L}-\p{L}\S*/u)[0]}"`);
  if (/ - |–|—/.test(t)) fail(file, 'travessão ou hífen com espaços no texto visível');
  for (const w of c.proibidas ?? []) if (new RegExp(`\\b${w}\\b`, 'i').test(t)) fail(file, `palavra proibida: ${w}`);
  if (html.includes('{{')) fail(file, 'marcador {{ }} sem preencher');
}

const html = readFileSync(join(dir, 'index.html'), 'utf8');
if ((html.match(/<h1[\s>]/gi) ?? []).length !== 1) fail('index.html', 'esperado um único h1');

const ld = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
for (const j of ld) try { JSON.parse(j); } catch (e) { fail('index.html', `JSON-LD inválido: ${e.message}`); }
for (const tipo of [c.tipoSchema ?? 'LocalBusiness', 'FAQPage', 'HowTo'])
  if (!ld.some((j) => j.includes(`"${tipo}"`))) fail('index.html', `JSON-LD sem ${tipo}`);

const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim();
if (!title || title.length < 30 || title.length > 60) fail('index.html', `title deve ter 30 a 60 caracteres (tem ${title?.length ?? 0})`);
const desc = html.match(/<meta\b(?=[^>]*name=["']description["'])[^>]*content="([^"]*)"/i)?.[1];
if (!desc || desc.length < 120 || desc.length > 160) fail('index.html', `meta description deve ter 120 a 160 caracteres (tem ${desc?.length ?? 0})`);

for (const f of ['index.html', 'privacidade.html', '404.html']) {
  const h = readFileSync(join(dir, f), 'utf8');
  textRules(f, h);
  for (const [, href] of h.matchAll(/href=["']([^"']*wa\.me[^"']*)["']/gi))
    if (!href.startsWith(`https://wa.me/${c.whatsapp}?text=`)) fail(f, `link wa.me incorreto: ${href}`);
}
for (const f of ['img/og-image.png', 'img/favicon.png', 'img/apple-touch-icon.png', 'robots.txt', 'sitemap.xml', 'llms.txt', '_headers'])
  if (!existsSync(join(dir, f))) fail(f, 'não existe');
if (c.video && !existsSync(join(dir, 'video/hero-paisagem.mp4'))) fail('video', 'falta hero-paisagem.mp4');

if (fails.length) { console.error(fails.join('\n')); process.exit(1); }
console.log('ok');
