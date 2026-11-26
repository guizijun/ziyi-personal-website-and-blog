/* background.js —— 动态背景引擎（极光 / 星河 / 粒子 / 流体渐变 / 图片 / 纯色） */
window.BgEngine = (function () {
  let canvas, ctx, raf = null, mode = 'aurora', opts = { speed: 1, image: '' };
  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  let stars = [], parts = [], blobs = [], t0 = performance.now();

  function resize() {
    if (!canvas) return;
    W = canvas.width = innerWidth * DPR;
    H = canvas.height = innerHeight * DPR;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    if (mode === 'stars') initStars();
    if (mode === 'particles') initParts();
    if (mode === 'aurora' || mode === 'gradient') initBlobs();
  }

  function initStars() {
    const n = Math.floor((innerWidth * innerHeight) / 4200);
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: (Math.random() * 1.6 + .3) * DPR,
      a: Math.random(), s: Math.random() * .02 + .004,
      d: Math.random() * .25 + .05
    }));
  }

  function initParts() {
    const n = Math.floor((innerWidth * innerHeight) / 12000);
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .45 * DPR,
      vy: (Math.random() - .5) * .45 * DPR,
      r: (Math.random() * 2.2 + .8) * DPR,
      hue: Math.random() * 60 - 20
    }));
  }

  function initBlobs() {
    blobs = [
      { x: .22, y: .28, r: .42, c: [124, 108, 255], vx: .00022, vy: .00018 },
      { x: .72, y: .32, r: .38, c: [94, 234, 212], vx: -.00018, vy: .00021 },
      { x: .5,  y: .78, r: .46, c: [59, 130, 246], vx: .00015, vy: -.00017 },
      { x: .82, y: .72, r: .32, c: [236, 72, 153], vx: -.0002,  vy: -.00012 }
    ];
  }

  function isLight() {
    return document.documentElement.getAttribute('data-mode') === 'light';
  }

  /* ---------- 各模式渲染 ---------- */
  function drawAurora(now) {
    const light = isLight();
    const g = ctx.createLinearGradient(0, 0, W, H);
    if (light) {
      g.addColorStop(0, '#eef1f8'); g.addColorStop(1, '#e2e8f6');
    } else {
      g.addColorStop(0, '#0b0e17'); g.addColorStop(1, '#121728');
    }
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    blobs.forEach((b, i) => {
      const tt = (now - t0) * .001 * opts.speed;
      const bx = (b.x + Math.sin(tt * (1 + i * .13) + i) * .12 + b.vx * tt * 40) * W;
      const by = (b.y + Math.cos(tt * (1 + i * .11) + i * 1.7) * .1 + b.vy * tt * 40) * H;
      const rad = b.r * Math.min(W, H) * (1 + Math.sin(tt * .6 + i) * .12);
      const rg = ctx.createRadialGradient(bx, by, 0, bx, by, rad);
      const a = light ? .38 : .55;
      rg.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${a})`);
      rg.addColorStop(.35, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${a * .62})`);
      rg.addColorStop(.7, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${a * .18})`);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    });

    // 顶部光晕（软边径向渐变，避免矩形光带造成的横向割裂）
    const pulse = (Math.sin(now * .0004) + 1) / 2;
    const glowX = W * (.5 + Math.sin(now * .00022) * .18);
    const glow = ctx.createRadialGradient(glowX, H * .1, 0, glowX, H * .1, Math.max(W, H) * .75);
    const c1 = light ? [150 + pulse * 30, 130, 255] : [130 + pulse * 50, 110, 255];
    const c2 = light ? [124, 150 + pulse * 25, 255] : [110, 150 + pulse * 40, 255];
    glow.addColorStop(0, `rgba(${c1[0] | 0},${c1[1] | 0},${c1[2] | 0},${light ? .16 : .22})`);
    glow.addColorStop(.45, `rgba(${c2[0] | 0},${c2[1] | 0},${c2[2] | 0},${light ? .07 : .1})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

  function drawGradient(now) {
    const light = isLight();
    const tt = (now - t0) * .00012 * opts.speed;
    const g = ctx.createLinearGradient(
      W * (.5 + Math.sin(tt) * .4), 0,
      W * (.5 + Math.cos(tt * .8) * .4), H
    );
    const shift = (Math.sin(tt * 1.4) + 1) / 2;
    if (light) {
      g.addColorStop(0, `hsl(${230 + shift * 40} 45% 88%)`);
      g.addColorStop(.5, `hsl(${255 + shift * 50} 55% 84%)`);
      g.addColorStop(1, `hsl(${190 + shift * 60} 50% 86%)`);
    } else {
      g.addColorStop(0, `hsl(${230 + shift * 40} 45% 12%)`);
      g.addColorStop(.5, `hsl(${255 + shift * 50} 55% 22%)`);
      g.addColorStop(1, `hsl(${190 + shift * 60} 50% 14%)`);
    }
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    blobs.forEach((b, i) => {
      const bx = (b.x + Math.sin(tt * 2 + i) * .14) * W;
      const by = (b.y + Math.cos(tt * 1.7 + i) * .12) * H;
      const rad = b.r * Math.min(W, H);
      const rg = ctx.createRadialGradient(bx, by, 0, bx, by, rad);
      const a = light ? .22 : .32;
      rg.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${a})`);
      rg.addColorStop(.4, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${a * .6})`);
      rg.addColorStop(.75, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${a * .16})`);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    });
  }

  function drawStars(now) {
    const light = isLight();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (light) {
      g.addColorStop(0, '#e8edf9'); g.addColorStop(1, '#d8e0f2');
    } else {
      g.addColorStop(0, '#070a14'); g.addColorStop(1, '#101728');
    }
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // 星云
    const tt = now * .00006 * opts.speed;
    for (let i = 0; i < 3; i++) {
      const bx = W * (.3 + i * .22 + Math.sin(tt + i) * .06);
      const by = H * (.3 + Math.cos(tt * .8 + i) * .1);
      const rg = ctx.createRadialGradient(bx, by, 0, bx, by, Math.min(W, H) * .35);
      const col = [[124,108,255],[94,234,212],[236,72,153]][i];
      rg.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${light ? .18 : .16})`);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    }

    stars.forEach(s => {
      s.a += s.s * opts.speed;
      const alpha = .35 + Math.abs(Math.sin(s.a)) * .65;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = light
        ? `rgba(90,100,150,${alpha * .55})`
        : `rgba(255,255,255,${alpha})`;
      ctx.fill();
      s.y += s.d * DPR * .12 * opts.speed;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    });
  }

  function drawParticles(now) {
    const light = isLight();
    const g = ctx.createLinearGradient(0, 0, W, H);
    if (light) {
      g.addColorStop(0, '#eaeef8'); g.addColorStop(1, '#dde4f4');
    } else {
      g.addColorStop(0, '#0a0d16'); g.addColorStop(1, '#141a2c');
    }
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    parts.forEach(p => {
      p.x += p.vx * opts.speed * DPR;
      p.y += p.vy * opts.speed * DPR;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = light
        ? `hsla(${230 + p.hue}, 60%, 45%, .5)`
        : `hsla(${230 + p.hue}, 80%, 70%, .55)`;
      ctx.fill();
    });

    // 连线
    const maxD = 140 * DPR;
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
        const d = Math.hypot(dx, dy);
        if (d < maxD) {
          ctx.strokeStyle = light
            ? `rgba(99,102,241,${(1 - d / maxD) * .2})`
            : `rgba(124,108,255,${(1 - d / maxD) * .18})`;
          ctx.lineWidth = DPR * .8;
          ctx.beginPath();
          ctx.moveTo(parts[i].x, parts[i].y);
          ctx.lineTo(parts[j].x, parts[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function loop(now) {
    if (!ctx) return;
    if (mode === 'aurora') drawAurora(now);
    else if (mode === 'gradient') drawGradient(now);
    else if (mode === 'stars') drawStars(now);
    else if (mode === 'particles') drawParticles(now);
    else ctx.clearRect(0, 0, W, H);
    raf = requestAnimationFrame(loop);
  }

  function set(newMode, newOpts) {
    mode = newMode || 'aurora';
    opts = { speed: 1, image: '', ...(newOpts || {}) };

    const imgEl = document.getElementById('bg-image');
    const showCanvas = ['aurora', 'stars', 'particles', 'gradient'].includes(mode);

    if (imgEl) {
      if (mode === 'image' && opts.image) {
        imgEl.style.backgroundImage = `url("${opts.image}")`;
        imgEl.style.display = 'block';
      } else {
        imgEl.style.display = 'none';
        imgEl.style.backgroundImage = '';
      }
    }

    if (canvas) canvas.style.display = showCanvas ? 'block' : 'none';

    if (raf) cancelAnimationFrame(raf), raf = null;
    if (showCanvas) {
      if (!canvas) {
        canvas = document.getElementById('bg-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        addEventListener('resize', resize);
      }
      resize();
      raf = requestAnimationFrame(loop);
    }
  }

  return { set };
})();
