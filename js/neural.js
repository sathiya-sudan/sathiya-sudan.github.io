// Hero background: drifting nodes that link up like a neural net and react to the cursor.
(() => {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouse = { x: -9999, y: -9999 };
  let nodes = [], w = 0, h = 0, dpr = 1, colors = {}, running = true, raf;

  function readColors() {
    const s = getComputedStyle(document.documentElement);
    colors.a = s.getPropertyValue('--accent-1').trim() || '#6366f1';
    colors.b = s.getPropertyValue('--accent-2').trim() || '#22d3ee';
    colors.light = document.documentElement.dataset.theme === 'light';
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(110, (w * h) / 12000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.8,
      t: Math.random() // colour mix between the two accents
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    const A = hexToRgb(colors.a), B = hexToRgb(colors.b);
    const linkDist = Math.min(150, w / 8);
    const baseAlpha = colors.light ? 0.35 : 0.5;

    for (const n of nodes) {
      if (!reduced) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        // gentle pull toward the cursor
        const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
        if (d < 180) { n.x += dx * 0.004; n.y += dy * 0.004; }
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const q = nodes[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < linkDist) {
          const t = (p.t + q.t) / 2;
          const c = A.map((v, k) => Math.round(v + (B[k] - v) * t));
          ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${(1 - d / linkDist) * baseAlpha * 0.6})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      // links to the cursor light up brighter
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 180) {
        ctx.strokeStyle = `rgba(${B[0]},${B[1]},${B[2]},${(1 - dm / 180) * 0.7})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }

    for (const n of nodes) {
      const c = A.map((v, k) => Math.round(v + (B[k] - v) * n.t));
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${baseAlpha + 0.4})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }

    if (running && !reduced) raf = requestAnimationFrame(frame);
  }

  canvas.parentElement.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

  // Pause when the hero is off-screen to save battery.
  new IntersectionObserver(([entry]) => {
    const was = running;
    running = entry.isIntersecting;
    if (running && !was && !reduced) raf = requestAnimationFrame(frame);
  }).observe(canvas);

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduced) frame(); }, 150); });
  document.addEventListener('themechange', () => { readColors(); if (reduced) frame(); });

  readColors(); resize(); frame();
})();
