// Renders the whole site from data/portfolio.json and wires up the interactions.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Escapes text and highlights any [PLACEHOLDER] marker so unfinished content is easy to spot.
  const txt = s => esc(s).replace(/\s*\[PLACEHOLDER(?::([^\]]*))?\]/g, (_, note) => ` <span class="ph" title="${note ? esc(note.trim()) : 'Needs real data'}">placeholder</span>`);

  const ICONS = {
    github: '<svg viewBox="0 0 24 24"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
    hf: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8.8" cy="10" r="1.3"/><circle cx="15.2" cy="10" r="1.3"/><path d="M8 14.2c1 1.6 2.4 2.3 4 2.3s3-.7 4-2.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    kaggle: '<svg viewBox="0 0 24 24"><path d="M18.83 23.84c-.02.1-.12.16-.3.16h-3.07c-.19 0-.35-.08-.48-.24l-5.08-6.46-1.41 1.35v5.03c0 .21-.11.32-.33.32H5.8c-.22 0-.33-.11-.33-.32V.32C5.47.11 5.58 0 5.8 0h2.37c.22 0 .33.11.33.32v14.02l6.06-6.13c.14-.14.3-.21.48-.21h3.16c.14 0 .23.06.28.17.06.14.04.25-.04.33l-6.41 6.2 6.68 8.8c.1.1.12.21.08.34z"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/></svg>',
    medium: '<svg viewBox="0 0 24 24"><ellipse cx="6.8" cy="12" rx="6.8" ry="6.9"/><ellipse cx="17.6" cy="12" rx="3.4" ry="6.5"/><ellipse cx="22.6" cy="12" rx="1.2" ry="5.8"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7.2L3.6 7v10.4h16.8V7L12 12.2z"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.4-3.4a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0zM8.5 17.7a3 3 0 0 1-4.2-4.2l3-3 1.4 1.4-3 3a1 1 0 0 0 1.4 1.4l3-3 1.4 1.4-3 3zm8.2-5.1-1.4-1.4 3-3a1 1 0 0 0-1.4-1.4l-3 3-1.4-1.4 3-3a3 3 0 0 1 4.2 4.2l-3 3z"/></svg>'
  };
  const SKILL_ICONS = {
    spark: '<svg viewBox="0 0 24 24"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>',
    flask: '<svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7.5 15h9"/></svg>'
  };

  Object.assign(SKILL_ICONS, {
    eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    wave: '<svg viewBox="0 0 24 24"><path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    pen: '<svg viewBox="0 0 24 24"><path d="M3 17c3-1 4-5 6-5s1 4 3 4 3-6 5-6 2 3 4 3"/><path d="M3 21h18"/></svg>',
    face: '<svg viewBox="0 0 24 24"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="10" r="3"/><path d="M7.5 17c1-2 2.6-3 4.5-3s3.5 1 4.5 3"/></svg>',
    scan: '<svg viewBox="0 0 24 24"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M4 12h16"/></svg>',
    cube: '<svg viewBox="0 0 24 24"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 22V12M21 7l-9 5-9-5"/></svg>'
  });

  let DATA;

  fetch('data/portfolio.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => { DATA = d; render(d); initEffects(); })
    .catch(err => {
      console.error('Could not load portfolio.json', err);
      $('#hero-name').textContent = 'Portfolio';
      $('#hero-headline').textContent = 'Content failed to load. If you opened index.html directly, serve the folder over HTTP (e.g. python3 -m http.server).';
    });

  // ---------------- Rendering ----------------
  function render(d) {
    const p = d.profile;
    document.title = `${p.name} · ${p.title}`;
    $('#logo-initials').textContent = p.initials;
    $('#hero-name').textContent = p.name;
    $('#hero-title').textContent = p.title;
    $('#hero-headline').innerHTML = txt(p.headline);
    if (p.openToWork) { const s = $('#hero-status'); s.hidden = false; s.lastElementChild.textContent = p.availability || 'Open to work'; }
    const resume = $('#resume-btn');
    if (p.resume) { resume.href = p.resume; $('#contact-cv').href = p.resume; } else { resume.remove(); $('#contact-cv').remove(); }

    const socials = [...(p.socials || [])];
    const socialHtml = socials.map(s => `<a class="social" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}" title="${esc(s.label)}">${ICONS[s.icon] || ICONS.link}</a>`).join('');
    const mailHtml = p.email ? `<a class="social" href="mailto:${esc(p.email)}" aria-label="Email" title="Email">${ICONS.mail}</a>` : '';
    $('#hero-socials').innerHTML = socialHtml + mailHtml;
    $('#contact-socials').innerHTML = socialHtml;

    // About
    $('#about-text').innerHTML = (d.about?.paragraphs || []).map(t => `<p>${txt(t)}</p>`).join('');
    $('#exploring').innerHTML = (d.about?.exploring || []).map(t => `<span class="chip">${txt(t)}</span>`).join('');
    $('#avatar-card').innerHTML = p.photo
      ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">`
      : `<div class="orbit"></div><span class="avatar-initials">${esc(p.initials)}</span>`;

    $('#stats').innerHTML = (d.stats || []).map((s, i) => `
      <div class="stat card spot reveal" style="--d:${i * 0.08}s">
        <div class="stat-value"><span class="gradient-text" data-count="${Number(s.value) || 0}">0</span><span class="gradient-text">${esc(s.suffix)}</span></div>
        <div class="stat-label">${txt(s.label)}</div>
      </div>`).join('');

    // Current role: banner + bento case studies
    const cr = d.currentRole;
    if (cr?.items?.length) {
      $('#role-banner').innerHTML = `
        <span class="now-pill"><span class="dot"></span>Now</span>
        <div class="role-main"><h3>${txt(cr.role)}</h3><div class="muted">${txt(cr.company)} · ${esc(cr.client)} · ${txt(cr.start)} — ${esc(cr.end)}</div></div>
        <p class="role-intro">${txt(cr.intro)}</p>`;
      $('#bento').innerHTML = cr.items.map((c, i) => `
        <article class="case card spot tilt reveal${c.size === 'wide' ? ' wide' : ''}" tabindex="0" data-case="${i}" style="--d:${(i % 3) * 0.08}s">
          <div class="case-top">
            <span class="case-icon">${SKILL_ICONS[c.icon] || SKILL_ICONS.spark}</span>
            <div><span class="case-domain">${esc(c.domain)}</span><h3>${esc(c.name)}</h3><p class="case-tagline">${esc(c.tagline)}</p></div>
          </div>
          <div class="case-metrics">${c.metrics.map(m => `<div><div class="metric-v gradient-text">${esc(m.value)}</div><div class="metric-l">${esc(m.label)}</div></div>`).join('')}</div>
          ${pipelineHtml(c.pipeline)}
          <span class="project-more">Read case study <span aria-hidden="true">→</span></span>
        </article>`).join('');
    } else {
      $('#work').remove();
    }

    // Skills
    $('#skills-grid').innerHTML = (d.skills || []).map((g, i) => `
      <article class="skill-card card spot tilt reveal" style="--d:${(i % 2) * 0.1}s">
        <div class="skill-head">
          <span class="skill-icon">${SKILL_ICONS[g.icon] || SKILL_ICONS.spark}</span>
          <h3>${esc(g.group)}</h3>
          <span class="skill-count">${g.items.length} skills</span>
        </div>
        <div class="chips">${g.items.map(s => `<span class="chip">${txt(s)}</span>`).join('')}</div>
      </article>`).join('');

    // Projects
    const projects = [...(d.projects || [])].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    const cats = d.projectCategories || [...new Set(projects.flatMap(pr => pr.categories))];
    $('#filters').innerHTML = ['All', ...cats].map((c, i) => {
      const n = c === 'All' ? projects.length : projects.filter(pr => pr.categories.includes(c)).length;
      return `<button class="filter${i === 0 ? ' active' : ''}" data-filter="${esc(c)}" role="tab">${esc(c)}<span class="n">${n}</span></button>`;
    }).join('');
    $('#projects-grid').innerHTML = projects.map((pr, i) => `
      <article class="project card spot tilt reveal${pr.featured ? ' featured' : ''}" tabindex="0" data-idx="${d.projects.indexOf(pr)}" data-cats="${esc(pr.categories.join('|'))}" style="--d:${(i % 3) * 0.08}s">
        <div class="project-thumb">
          ${pr.image ? `<img src="${esc(pr.image)}" alt="" loading="lazy">` : thumbSvg(pr.title)}
          ${pr.featured ? '<span class="badge-featured">Featured</span>' : ''}
        </div>
        <div class="project-body">
          <span class="project-cats">${pr.categories.map(esc).join(' · ')}</span>
          <h3>${txt(pr.title)}</h3>
          <p>${txt(pr.summary)}</p>
          <div class="chips">${pr.stack.slice(0, 4).map(s => `<span class="chip mono">${esc(s)}</span>`).join('')}</div>
          <span class="project-more">View details <span aria-hidden="true">→</span></span>
        </div>
      </article>`).join('');

    // Experience
    const tl = $('#timeline');
    tl.insertAdjacentHTML('beforeend', (d.experience || []).map(x => `
      <div class="tl-item reveal">
        <span class="tl-dot"></span>
        <article class="tl-card card spot">
          <div class="tl-top"><h3>${txt(x.role)}</h3><span class="tl-date">${esc(x.start)} — ${esc(x.end)}</span></div>
          <div class="tl-company">${esc(x.company)}${x.location ? ` <span class="muted">· ${esc(x.location)}</span>` : ''}</div>
          <ul>${x.points.map(pt => `<li>${txt(pt)}</li>`).join('')}</ul>
          <div class="chips">${(x.tags || []).map(t => `<span class="chip mono">${esc(t)}</span>`).join('')}</div>
        </article>
      </div>`).join(''));

    // Research & writing
    const rowLink = (item, main, meta, icon) => {
      const tag = item.url ? 'a' : 'div';
      const attrs = item.url ? ` href="${esc(item.url)}" target="_blank" rel="noopener"` : '';
      return `<li><${tag} class="row-card card spot reveal"${attrs}>
        <span class="row-icon">${icon}</span>
        <div class="row-main"><h4>${txt(main)}</h4><div class="meta">${meta}</div></div>
        ${item.url ? '<span class="arrow">↗</span>' : ''}
      </${tag}></li>`;
    };
    $('#publications').innerHTML = (d.publications || []).map(x => rowLink(x, x.title, `${esc(x.venue)} · ${esc(x.year)}`, 'PDF')).join('');
    $('#blog').innerHTML = (d.blog || []).map(x => rowLink(x, x.title, `${esc(x.platform)} · ${esc(x.date)}`, 'TXT')).join('');
    $('#education-list').innerHTML = (d.education || []).map(x => rowLink({}, x.degree, `${esc(x.school)} · ${esc(x.year)}${x.detail ? ' · ' + esc(x.detail) : ''}`, 'EDU')).join('').replace(/<\/?li>/g, '');
    $('#certs-list').innerHTML = (d.certifications || []).map(x => rowLink(x, x.name, `${esc(x.issuer)} · ${esc(x.year)}`, 'CRT')).join('').replace(/<\/?li>/g, '');

    // Hide empty blocks and sections
    const hideIfEmpty = (wrap, list) => { if (!$(list).children.length) $(wrap).remove(); };
    hideIfEmpty('#publications-wrap', '#publications');
    hideIfEmpty('#blog-wrap', '#blog');
    hideIfEmpty('#education-wrap', '#education-list');
    hideIfEmpty('#certs-wrap', '#certs-list');
    const empty = { skills: !d.skills?.length, projects: !projects.length, experience: !d.experience?.length, research: !$('#research .link-list'), education: !$('#education-list, #certs-list') };
    Object.entries(empty).forEach(([id, isEmpty]) => { if (isEmpty) $('#' + id)?.remove(); });

    // Contact + footer
    $('#contact-availability').innerHTML = txt(p.openToWork
      ? `I'm currently ${(p.availability || 'open to work').replace(/^./, c => c.toLowerCase())}. Whether it's a role, a collaboration, or just an idea — my inbox is open.`
      : 'Whether it\'s a role, a collaboration, or just an idea — my inbox is open.');
    $('#contact-email').href = `mailto:${p.email}`;
    $('#footer-text').textContent = `© ${new Date().getFullYear()} ${p.name} · Built with vanilla JS, hosted on GitHub Pages`;

    // Nav links from sections
    $('#nav-links').innerHTML = $$('section[data-nav]').map(s => `<a href="#${s.id}">${esc(s.dataset.nav)}</a>`).join('');
  }

  function pipelineHtml(steps = []) {
    return `<div class="pipeline">${steps.map((st, i) =>
      (i ? `<span class="pipe-link" style="--i:${i * 0.2}s"></span>` : '') + `<span class="pipe-step">${esc(st)}</span>`).join('')}</div>`;
  }

  function openCase(idx) {
    const c = DATA.currentRole?.items?.[idx];
    if (!c) return;
    lastFocus = document.activeElement;
    const list = (label, arr) => arr?.length ? `<div class="modal-section"><h4>${label}</h4><ul>${arr.map(x => `<li>${txt(x)}</li>`).join('')}</ul></div>` : '';
    $('#modal-body').innerHTML = `
      <span class="project-cats">${esc(c.domain)}</span>
      <h3 id="modal-title">${esc(c.name)}</h3>
      <p class="muted">${esc(c.tagline)}</p>
      <div class="modal-metrics">${c.metrics.map(m => `<div class="m"><div class="metric-v gradient-text">${esc(m.value)}</div><div class="metric-l">${esc(m.label)}</div></div>`).join('')}</div>
      <div class="modal-section"><h4>Pipeline</h4><div class="modal-pipeline">${pipelineHtml(c.pipeline)}</div></div>
      ${list('Challenge', c.challenge)}${list('Approach', c.approach)}
      ${c.impact ? `<div class="modal-section"><h4>Impact</h4><p>${txt(c.impact)}</p></div>` : ''}
      <div class="modal-section"><h4>Stack</h4><div class="chips">${c.stack.map(x => `<span class="chip mono">${esc(x)}</span>`).join('')}</div></div>`;
    const m = $('#project-modal');
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.modal-close', m).focus();
  }

  // Deterministic abstract "network" thumbnail for projects without an image.
  function thumbSvg(seedText) {
    let seed = [...seedText].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    const pts = Array.from({ length: 14 }, () => [20 + rnd() * 360, 15 + rnd() * 195]);
    const id = 'g' + seed.toString(36);
    let lines = '';
    pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 110) lines += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
    }));
    const dots = pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${2 + rnd() * 2.5}"/>`).join('');
    return `<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent-1)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient></defs>
      <g stroke="url(#${id})" stroke-width="1" opacity="0.55">${lines}</g>
      <g fill="url(#${id})">${dots}</g></svg>`;
  }

  // ---------------- Effects & interactions ----------------
  function initEffects() {
    const root = document.documentElement;

    // Cursor glow + card spotlight (one listener, updates CSS variables)
    let ticking = false, lastEvt;
    window.addEventListener('pointermove', e => {
      lastEvt = e;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        root.style.setProperty('--cx', lastEvt.clientX + 'px');
        root.style.setProperty('--cy', lastEvt.clientY + 'px');
        const card = lastEvt.target.closest?.('.spot');
        if (card) {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', lastEvt.clientX - r.left + 'px');
          card.style.setProperty('--my', lastEvt.clientY - r.top + 'px');
        }
        ticking = false;
      });
    }, { passive: true });

    // 3D tilt
    if (!reduced && matchMedia('(hover: hover)').matches) {
      $$('.tilt').forEach(el => {
        el.addEventListener('pointermove', e => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-4px)`;
        });
        el.addEventListener('pointerleave', () => { el.style.transform = ''; });
      });
    }

    // Reveal on scroll + count-up
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      $$('[data-count]', en.target).forEach(countUp);
      io.unobserve(en.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => io.observe(el));

    // Typewriter
    typewriter($('#typewriter'), DATA.profile.roles || []);

    // Nav: scrolled state, progress bar, active link, timeline fill
    const nav = $('#nav'), links = $$('#nav-links a'), sections = $$('section[data-nav]');
    const tl = $('#timeline');
    const onScroll = () => {
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      nav.classList.toggle('scrolled', y > 20);
      root.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
      let current = '';
      sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.4) current = s.id; });
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
      if (tl) {
        const r = tl.getBoundingClientRect();
        const pct = Math.min(100, Math.max(0, ((innerHeight * 0.6 - r.top) / r.height) * 100));
        tl.style.setProperty('--tl', pct + '%');
      }
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu
    const menuBtn = $('#menu-toggle'), navLinks = $('#nav-links');
    menuBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
    navLinks.addEventListener('click', e => { if (e.target.matches('a')) { navLinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); } });

    // Theme toggle
    $('#theme-toggle').addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      $('meta[name="theme-color"]').content = next === 'light' ? '#f7f8fc' : '#0a0b10';
      document.dispatchEvent(new Event('themechange'));
    });

    // Project filters
    $('#filters')?.addEventListener('click', e => {
      const btn = e.target.closest('.filter');
      if (!btn) return;
      $$('.filter').forEach(b => b.classList.toggle('active', b === btn));
      const f = btn.dataset.filter;
      $$('.project').forEach(card => {
        const show = f === 'All' || card.dataset.cats.split('|').includes(f);
        card.classList.toggle('hide', !show);
        if (show) { card.classList.remove('in'); requestAnimationFrame(() => card.classList.add('in')); }
      });
    });

    // Project modal
    const grid = $('#projects-grid');
    grid?.addEventListener('click', e => { const c = e.target.closest('.project'); if (c) openProject(+c.dataset.idx); });
    grid?.addEventListener('keydown', e => { const c = e.target.closest('.project'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openProject(+c.dataset.idx); } });
    const bento = $('#bento');
    bento?.addEventListener('click', e => { const c = e.target.closest('.case'); if (c) openCase(+c.dataset.case); });
    bento?.addEventListener('keydown', e => { const c = e.target.closest('.case'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openCase(+c.dataset.case); } });
    $$('[data-close]').forEach(el => el.addEventListener('click', closeOverlays));

    // Copy email
    $('#copy-email').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(DATA.profile.email); toast('Email copied to clipboard'); }
      catch { toast(DATA.profile.email); }
    });

    initCommandPalette();

    addEventListener('keydown', e => {
      if (e.key === 'Escape') closeOverlays();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCmdk(); }
    });
    $('#cmdk-open').addEventListener('click', openCmdk);
  }

  function countUp(el) {
    const target = +el.dataset.count;
    if (reduced) { el.textContent = target; return; }
    const start = performance.now(), dur = 1400;
    const step = now => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function typewriter(el, words) {
    if (!el || !words.length) return;
    if (reduced) { el.textContent = words[0]; return; }
    let w = 0, i = 0, deleting = false;
    const tick = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      el.textContent = word.slice(0, i);
      let delay = deleting ? 35 : 70;
      if (!deleting && i === word.length) { deleting = true; delay = 1800; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
      setTimeout(tick, delay);
    };
    tick();
  }

  let lastFocus;
  function openProject(idx) {
    const pr = DATA.projects[idx];
    if (!pr) return;
    lastFocus = document.activeElement;
    const sec = (label, v) => v ? `<div class="modal-section"><h4>${label}</h4><p>${txt(v)}</p></div>` : '';
    const links = [
      pr.links?.github && `<a class="btn btn-ghost" href="${esc(pr.links.github)}" target="_blank" rel="noopener">${ICONS.github.replace('<svg', '<svg width="16" height="16" fill="currentColor"')} Code</a>`,
      pr.links?.demo && `<a class="btn btn-primary" href="${esc(pr.links.demo)}" target="_blank" rel="noopener">Live demo ↗</a>`
    ].filter(Boolean).join('');
    $('#modal-body').innerHTML = `
      <span class="project-cats">${pr.categories.map(esc).join(' · ')}</span>
      <h3 id="modal-title">${txt(pr.title)}</h3>
      <p class="muted">${txt(pr.summary)}</p>
      ${pr.image ? `<img class="modal-img" src="${esc(pr.image)}" alt="">` : ''}
      ${sec('Problem', pr.problem)}${sec('Approach', pr.approach)}${sec('Result', pr.result)}
      <div class="modal-section"><h4>Stack</h4><div class="chips">${pr.stack.map(s => `<span class="chip mono">${esc(s)}</span>`).join('')}</div></div>
      ${links ? `<div class="modal-links">${links}</div>` : ''}`;
    const m = $('#project-modal');
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.modal-close', m).focus();
  }

  function closeOverlays() {
    ['#project-modal', '#cmdk'].forEach(s => { $(s).hidden = true; });
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  }

  // ---------------- Command palette ----------------
  let cmdItems = [], cmdSel = 0;
  function initCommandPalette() {
    const p = DATA.profile;
    cmdItems = [
      ...$$('section[data-nav]').map(s => ({ label: s.dataset.nav, kind: 'Section', run: () => location.hash = s.id })),
      ...(DATA.currentRole?.items || []).map((c, i) => ({ label: `${c.name} — ${c.tagline}`, kind: 'Case study', run: () => { document.getElementById('work').scrollIntoView(); setTimeout(() => openCase(i), 300); } })),
      ...DATA.projects.map((pr, i) => ({ label: pr.title.replace(/\s*\[PLACEHOLDER[^\]]*\]/, ''), kind: 'Project', run: () => { document.getElementById('projects').scrollIntoView(); setTimeout(() => openProject(i), 300); } })),
      ...(p.socials || []).map(s => ({ label: s.label, kind: 'Link', run: () => open(s.url, '_blank', 'noopener') })),
      p.resume && { label: 'Download CV', kind: 'File', run: () => open(p.resume, '_blank', 'noopener') },
      { label: 'Copy email', kind: 'Action', run: () => $('#copy-email').click() },
      { label: 'Toggle light / dark theme', kind: 'Action', run: () => $('#theme-toggle').click() }
    ].filter(Boolean);

    const input = $('#cmdk-input');
    input.addEventListener('input', () => { cmdSel = 0; drawCmd(); });
    input.addEventListener('keydown', e => {
      const n = $$('#cmdk-list li').length;
      if (e.key === 'ArrowDown') { e.preventDefault(); cmdSel = (cmdSel + 1) % n; drawCmd(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); cmdSel = (cmdSel - 1 + n) % n; drawCmd(); }
      if (e.key === 'Enter') { e.preventDefault(); runCmd(cmdSel); }
    });
    $('#cmdk-list').addEventListener('click', e => { const li = e.target.closest('li'); if (li) runCmd(+li.dataset.i); });
  }
  const filteredCmds = () => {
    const q = $('#cmdk-input').value.trim().toLowerCase();
    return cmdItems.filter(c => !q || (c.label + ' ' + c.kind).toLowerCase().includes(q));
  };
  function drawCmd() {
    const list = filteredCmds();
    $('#cmdk-list').innerHTML = list.length
      ? list.map((c, i) => `<li role="option" data-i="${i}" class="${i === cmdSel ? 'sel' : ''}" aria-selected="${i === cmdSel}"><span>${esc(c.label)}</span><span class="k">${c.kind}</span></li>`).join('')
      : '<li class="muted">No results</li>';
    $('#cmdk-list .sel')?.scrollIntoView({ block: 'nearest' });
  }
  function runCmd(i) { const c = filteredCmds()[i]; if (!c) return; closeOverlays(); c.run(); }
  function openCmdk() {
    lastFocus = document.activeElement;
    $('#cmdk').hidden = false; $('#cmdk-input').value = ''; cmdSel = 0; drawCmd(); $('#cmdk-input').focus();
  }

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
  }
})();
