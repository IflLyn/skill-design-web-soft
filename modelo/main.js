// Interações da landing. Sem bibliotecas; tudo opcional (sem JS o conteúdo fica visível).
(function () {
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raiz = document.documentElement;

  function menu() {
    var btn = document.querySelector('.menu-btn');
    var painel = document.getElementById('menu');
    if (!btn || !painel) return;
    function definir(aberto) {
      btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      btn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
      raiz.style.overflow = aberto ? 'hidden' : '';
      // fundo inerte enquanto o menu está aberto
      Array.prototype.forEach.call(document.querySelectorAll('main, footer, .wa-flutuante'), function (el) {
        if (aberto) el.setAttribute('inert', ''); else el.removeAttribute('inert');
      });
    }
    btn.addEventListener('click', function () {
      definir(btn.getAttribute('aria-expanded') !== 'true');
    });
    painel.addEventListener('click', function (e) {
      if (e.target.closest('a')) definir(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        definir(false);
        btn.focus();
      }
    });
    var mq = window.matchMedia('(min-width: 960px)');
    var fecha = function (e) { if (e.matches) definir(false); };
    if (mq.addEventListener) mq.addEventListener('change', fecha); else mq.addListener(fecha);
  }

  // Uma vez só: aplica a classe quando o elemento aparece e para de observar.
  function uma_vez(itens, classe, opcoes) {
    if (reduzir || !('IntersectionObserver' in window)) {
      itens.forEach(function (el) { el.classList.add(classe); });
      return;
    }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add(classe);
        io.unobserve(en.target);
      });
    }, opcoes);
    itens.forEach(function (el) { io.observe(el); });
  }

  function revelar_secoes() {
    try {
      uma_vez(Array.prototype.slice.call(document.querySelectorAll('.reveal')), 'is-visible', { threshold: 0.15 });
    } catch (e) {
      raiz.classList.remove('js'); // falhou: nada fica escondido
    }
  }

  function frase() {
    var p = document.getElementById('frase');
    if (!p) return;
    var texto = p.textContent.trim();
    var visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    texto.split(/(\s+)/).forEach(function (parte) {
      if (/^\s+$/.test(parte)) {
        visual.appendChild(document.createTextNode(' '));
      } else if (parte) {
        var w = document.createElement('span');
        w.className = 'w';
        w.textContent = parte;
        visual.appendChild(w);
      }
    });
    var leitura = document.createElement('span');
    leitura.className = 'sr';
    leitura.textContent = texto;
    p.textContent = '';
    p.appendChild(leitura);
    p.appendChild(visual);
    // a palavra acende ao cruzar a linha de gatilho (a 35% da base da tela)
    uma_vez(Array.prototype.slice.call(visual.children), 'on', { rootMargin: '0px 0px -35% 0px' });
  }

  // Vídeos das cenas (hero e CTA final): só tocam com movimento liberado, sem economia de dados e à vista.
  function videos() {
    var retrato = window.matchMedia('(orientation: portrait)').matches;
    var economia = navigator.connection && navigator.connection.saveData;
    Array.prototype.forEach.call(document.querySelectorAll('.cena-video'), function (video) {
      if (retrato) video.poster = 'video/hero-retrato.jpg';
      if (reduzir || economia || !('IntersectionObserver' in window)) return;
      video.muted = true;
      var carregado = false;
      new IntersectionObserver(function (entradas) {
        if (entradas[entradas.length - 1].isIntersecting) {
          if (!carregado) {
            carregado = true;
            video.preload = 'auto';
            var inicio = parseFloat(video.getAttribute('data-inicio'));
            if (inicio) video.addEventListener('loadedmetadata', function () { video.currentTime = inicio; }, { once: true });
            video.load();
          }
          var p = video.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          video.pause();
        }
      }, { rootMargin: '200px 0px' }).observe(video);
    });
  }

  // Rede de pontos sobre cada vídeo (hero, frase e CTA final): os pontos derivam devagar,
  // ligam-se quando estão perto e se ligam também ao cursor. Cada rede pausa fora da tela.
  function fundo() {
    Array.prototype.forEach.call(document.querySelectorAll('canvas.rede'), function (tela) {
      if (tela.getContext) rede(tela, tela.closest('section'));
    });
  }

  function rede(tela, area) {

    var ctx = tela.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, pontos = [], LIGA = 150, CURSOR = 200;
    var cursor = { x: -1e4, y: -1e4 };
    function medir() {
      W = tela.clientWidth; H = tela.clientHeight;
      tela.width = W * dpr; tela.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(110, Math.max(28, W * H / 15000)));
      pontos = [];
      for (var i = 0; i < n; i++) {
        var ang = Math.random() * Math.PI * 2, vel = 6 + Math.random() * 10; // px por segundo
        pontos.push({ x: Math.random() * W, y: Math.random() * H, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, r: Math.random() < 0.2 ? 2.4 : 1.4 });
      }
    }
    function desenhar(dt) {
      ctx.clearRect(0, 0, W, H);
      var i, j, a, b, dx, dy, d;
      for (i = 0; i < pontos.length; i++) {
        a = pontos[i];
        a.x += a.vx * dt; a.y += a.vy * dt;
        if (a.x < 0 || a.x > W) { a.vx = -a.vx; a.x = Math.min(W, Math.max(0, a.x)); }
        if (a.y < 0 || a.y > H) { a.vy = -a.vy; a.y = Math.min(H, Math.max(0, a.y)); }
      }
      ctx.lineWidth = 1;
      for (i = 0; i < pontos.length; i++) {
        a = pontos[i];
        for (j = i + 1; j < pontos.length; j++) {
          b = pontos[j]; dx = a.x - b.x; dy = a.y - b.y;
          if (Math.abs(dx) > LIGA || Math.abs(dy) > LIGA) continue;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d > LIGA) continue;
          ctx.strokeStyle = 'rgba({{ACAO_RGB}}, ' + (0.28 * (1 - d / LIGA)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        dx = a.x - cursor.x; dy = a.y - cursor.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < CURSOR) {
          ctx.strokeStyle = 'rgba({{DETALHE_RGB}}, ' + (0.5 * (1 - d / CURSOR)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(cursor.x, cursor.y); ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba({{DETALHE_RGB}}, 0.75)';
      for (i = 0; i < pontos.length; i++) {
        a = pontos[i];
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    medir();
    var largura = W;
    window.addEventListener('resize', function () {
      // no celular a barra de endereço muda só a altura; não sorteia tudo de novo por isso
      if (tela.clientWidth !== largura) { medir(); largura = W; } else { W = tela.clientWidth; H = tela.clientHeight; tela.width = W * dpr; tela.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      if (reduzir) desenhar(0);
    });
    if (reduzir || !('IntersectionObserver' in window)) { desenhar(0); return; }

    area.addEventListener('pointermove', function (e) {
      var r = tela.getBoundingClientRect();
      cursor.x = e.clientX - r.left; cursor.y = e.clientY - r.top;
    });
    area.addEventListener('pointerleave', function () { cursor.x = cursor.y = -1e4; });

    var quadro = 0, antes = 0;
    function passo(agora) {
      desenhar(antes ? Math.min(agora - antes, 50) / 1000 : 0);
      antes = agora;
      quadro = requestAnimationFrame(passo);
    }
    new IntersectionObserver(function (entradas) {
      var visivel = entradas[entradas.length - 1].isIntersecting;
      if (visivel && !quadro) { antes = 0; quadro = requestAnimationFrame(passo); }
      if (!visivel && quadro) { cancelAnimationFrame(quadro); quadro = 0; }
    }).observe(area);
  }

  // Rolagem no estilo cena a cena. Cada quadro calcula, pela posição na tela:
  // --p dos painéis (crescem até a largura toda), --z das mídias das cenas (afastam), --l da linha dos passos,
  // o trilho dos recursos preso à tela no computador (--r é o progresso) e o cabeçalho que some ao descer.
  function rolagem() {
    if (reduzir) return;
    var lim = function (x) { return Math.min(1, Math.max(0, x)); };
    var paineis = Array.prototype.slice.call(document.querySelectorAll('.painel'));
    var cenas = Array.prototype.slice.call(document.querySelectorAll('.cena'));
    var passos = document.querySelector('.passos');
    var secao = document.querySelector('.recursos-secao');
    var trilho = secao && secao.querySelector('.recursos-trilho');
    var progresso = secao && secao.querySelector('.recursos-progresso');
    var topo = document.querySelector('.topo');
    var menuBtn = document.querySelector('.menu-btn');
    var largo = window.matchMedia('(min-width: 960px)');
    var distancia = 0, ultimoY = window.scrollY, agendado = false;

    function medir() {
      if (!secao) return;
      var fixar = largo.matches;
      secao.classList.toggle('fixar', fixar);
      trilho.style.transform = '';
      if (fixar) {
        // até o último recurso encostar na margem direita (a mesma folga da esquerda)
        var ultimo = trilho.lastElementChild.getBoundingClientRect();
        distancia = Math.max(0, ultimo.right - (window.innerWidth - parseFloat(getComputedStyle(trilho).paddingLeft)));
        secao.style.height = (window.innerHeight + distancia) + 'px';
      } else {
        secao.style.height = '';
      }
    }

    function quadro() {
      agendado = false;
      var vh = window.innerHeight, y = window.scrollY;
      paineis.forEach(function (el) {
        el.style.setProperty('--p', lim((vh - el.getBoundingClientRect().top) / (vh * 0.7)).toFixed(3));
      });
      cenas.forEach(function (el) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--z', lim((vh - r.top) / (vh + r.height)).toFixed(3));
      });
      if (passos) {
        var rp = passos.getBoundingClientRect();
        passos.style.setProperty('--l', lim((vh * 0.6 - rp.top) / rp.height).toFixed(3));
      }
      if (secao && secao.classList.contains('fixar')) {
        var rs = secao.getBoundingClientRect();
        var t = distancia ? lim(-rs.top / distancia) : 0;
        trilho.style.transform = 'translate3d(' + (-t * distancia).toFixed(1) + 'px, 0, 0)';
        progresso.style.setProperty('--r', t.toFixed(3));
      }
      if (topo && !(menuBtn && menuBtn.getAttribute('aria-expanded') === 'true')) {
        if (y > ultimoY + 4 && y > 200) topo.classList.add('recolhido');
        else if (y < ultimoY - 4 || y <= 200) topo.classList.remove('recolhido');
      }
      ultimoY = y;
    }
    function agendar() { if (!agendado) { agendado = true; requestAnimationFrame(quadro); } }

    medir();
    quadro();
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', function () { medir(); agendar(); });
    // o foco do teclado nunca fica escondido atrás do cabeçalho recolhido
    if (topo) topo.addEventListener('focusin', function () { topo.classList.remove('recolhido'); });
  }

  // Dúvidas: abre e fecha com a altura animada (o <details> nativo pula direto).
  function duvidas() {
    if (reduzir) return;
    var curva = 'cubic-bezier(0.22, 1, 0.36, 1)';
    Array.prototype.forEach.call(document.querySelectorAll('.faq details'), function (d) {
      var resumo = d.querySelector('summary'), texto = d.querySelector('p'), anim = null;
      resumo.addEventListener('click', function (e) {
        e.preventDefault();
        var inicio = d.offsetHeight, fechar = d.open && !d.classList.contains('fechando');
        if (anim) anim.cancel();
        var fim;
        if (fechar) {
          d.classList.add('fechando');
          fim = resumo.offsetHeight + (d.offsetHeight - d.clientHeight);
        } else {
          d.classList.remove('fechando');
          d.open = true;
          fim = d.offsetHeight;
          texto.animate({ opacity: [0, 1], transform: ['translateY(8px)', 'none'] }, { duration: 500, delay: 100, easing: curva, fill: 'backwards' });
        }
        d.style.overflow = 'hidden';
        anim = d.animate({ height: [inicio + 'px', fim + 'px'] }, { duration: 500, easing: curva });
        anim.onfinish = function () {
          if (fechar) { d.open = false; d.classList.remove('fechando'); }
          d.style.overflow = '';
          anim = null;
        };
      });
    });
  }

  // Botões principais puxam levemente na direção do cursor (só com mouse).
  function magnetico() {
    if (reduzir || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    Array.prototype.forEach.call(document.querySelectorAll('.btn-wa'), function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.translate = (x * 12).toFixed(1) + 'px ' + (y * 8).toFixed(1) + 'px';
      });
      btn.addEventListener('pointerleave', function () { btn.style.translate = ''; });
    });
  }

  // Botão flutuante do WhatsApp some enquanto o botão do hero está à vista (não cobre o hero no celular).
  function botao_flutuante() {
    var flutuante = document.querySelector('.wa-flutuante');
    var cta = document.querySelector('.hero .btn-wa');
    if (!flutuante || !cta || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entradas) {
      flutuante.classList.toggle('oculto', entradas[entradas.length - 1].isIntersecting);
    }).observe(cta);
  }

  revelar_secoes();
  [menu, botao_flutuante, frase, fundo, videos, rolagem, magnetico, duvidas].forEach(function (f) {
    try { f(); } catch (e) { /* um recurso quebrado não derruba os outros */ }
  });
})();
