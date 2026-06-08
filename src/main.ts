/* InstateMe acquisition site — interactions (TypeScript source).
   Compiled to ../assets/main.js via `npm run build`. */
(function () {
  'use strict';

  const byId = <T extends HTMLElement = HTMLElement>(id: string): T | null =>
    document.getElementById(id) as T | null;

  const nav = byId('nav');
  const burger = byId<HTMLButtonElement>('burger');
  const mobileMenu = byId('mobileMenu');
  const floatCta = byId('floatCta');
  const hero = byId('hero');

  /* ---- Sticky nav state (solid background once past the hero top) ---- */
  function onScroll(): void {
    const y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-stuck', y > 40);

    // Floating CTA appears after the hero, hides near the access form
    const access = byId('access');
    const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 600;
    const accessTop = access ? access.offsetTop - window.innerHeight : Infinity;
    if (floatCta) floatCta.classList.toggle('show', y > heroBottom && y < accessTop);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  function closeMenu(): void {
    if (mobileMenu) mobileMenu.classList.remove('open');
    if (nav) nav.classList.remove('is-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  if (burger && mobileMenu && nav) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* ---- On mobile, "Request access" jumps to the form, not the section heading ---- */
  document.querySelectorAll<HTMLAnchorElement>('a[href="#access"]').forEach((a) => {
    a.addEventListener('click', (e: MouseEvent) => {
      if (window.innerWidth <= 860) {
        const formEl = byId('reqform');
        if (formEl) {
          e.preventDefault();
          formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (history.replaceState) history.replaceState(null, '', '#access');
        }
      }
    });
  });

  /* ---- Reveal-on-scroll + trigger bar/chart fills ---- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll<HTMLElement>(
    '.reveal, .fin__chart, .model, .ask__bridge, .bars, .model__bars'
  );

  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-in'));
  }

  /* ---- Count-up for the "86" stat ---- */
  const counters = document.querySelectorAll<HTMLElement>('[data-count]');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const target = parseInt(el.getAttribute('data-count') || '0', 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const dur = 1100;
          let start: number | null = null;
          const step = (ts: number): void => {
            if (start === null) start = ts;
            const p = Math.min((ts - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          co.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => co.observe(el));
  }

  /* ---- Request-access form → emails jsilver@instateme.com (FormSubmit AJAX) ---- */
  const form = byId<HTMLFormElement>('reqform');
  if (form) {
    // POSTs to FormSubmit, which forwards the submission as an email.
    const ENDPOINT = 'https://formsubmit.co/ajax/jsilver@instateme.com';
    const statusEl = byId('reqStatus');
    const submitBtn = byId<HTMLButtonElement>('reqSubmit');

    const setStatus = (kind: '' | 'ok' | 'err', msg: string): void => {
      if (!statusEl) return;
      statusEl.hidden = !msg;
      statusEl.textContent = msg;
      statusEl.className = 'reqform__status' + (kind ? ' ' + kind : '');
    };

    const mailtoFallback = (name: string, email: string, thesis: string, pof: string): void => {
      const subject = `InstateMe — Data room request (${name})`;
      const body =
        `Name: ${name}\nEmail: ${email}\nProof of funds: ${pof}\n\n` +
        `Acquisition thesis:\n${thesis || '(to discuss on a call)'}`;
      window.location.href =
        'mailto:jsilver@instateme.com?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(body);
    };

    form.addEventListener('submit', (e: SubmitEvent) => {
      e.preventDefault();

      // Honeypot — silently drop bots.
      const honey = form.elements.namedItem('_honey') as HTMLInputElement | null;
      if (honey && honey.value) return;

      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const thesis = (data.get('thesis') || '').toString().trim();
      const pof = data.get('pof') ? 'Yes' : 'Not indicated';

      if (!name || !email) {
        const miss = form.querySelector<HTMLInputElement>(
          `input[name="${name ? 'email' : 'name'}"]`
        );
        if (miss) miss.focus();
        return;
      }

      const orig = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      setStatus('', '');

      const payload: Record<string, string> = {
        name,
        email,
        'Acquisition thesis': thesis || '(to discuss on a call)',
        'Proof of funds': pof,
        _subject: `InstateMe data-room request — ${name}`,
        _template: 'table',
        _captcha: 'false',
      };

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((r) => (r.ok ? r.json().catch(() => ({})) : Promise.reject(r)))
        .then(() => {
          form.reset();
          setStatus('ok', 'Thanks — your request is in. Jake will reply within 24 hours.');
        })
        .catch(() => {
          // If the request fails, fall back to the buyer's email client so nothing is lost.
          setStatus('err', 'Opening your email app to send this directly…');
          mailtoFallback(name, email, thesis, pof);
        })
        .then(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = orig;
          }
        });
    });
  }

  /* ---- Market opportunity calculator ---- */
  (function calculator(): void {
    const capEl = byId<HTMLInputElement>('capture');
    if (!capEl) return;
    const marginEl = byId<HTMLInputElement>('margin');
    const txEl = byId<HTMLInputElement>('txBase');
    const chipsWrap = byId('stateChips');
    if (!marginEl || !txEl || !chipsWrap) return;

    const presets = document.querySelectorAll<HTMLButtonElement>('.preset');
    const PRICE = 1_000_000;

    interface StateRow {
      k: string;
      fr: number; // out-of-state freshmen / year
      fee: number; // fee = one-semester tuition gap
      net: number; // net savings / student
      base: number; // base-case (2%) annual revenue, for the chip label
    }

    // Per-state model (from the market-sizing workbook).
    const STATES: StateRow[] = [
      { k: 'AR', fr: 3565.0192, fee: 8114.59, net: 48687.56, base: 578574 },
      { k: 'UT', fr: 4504.8076, fee: 8668.17, net: 43340.87, base: 780969 },
      { k: 'NV', fr: 2469.4512, fee: 8076.82, net: 40384.1, base: 398906 },
      { k: 'NM', fr: 1661.494, fee: 7919.05, net: 39595.24, base: 263149 },
      { k: 'ND', fr: 2849.6947, fee: 2275.11, net: 11375.55, base: 129667 },
      { k: 'SD', fr: 1683.6535, fee: 1721.86, net: 8609.3, base: 57980 },
    ];
    const TX = { rev: 389000, students: 24, saved: 24 * 99000 };
    const active: Record<string, boolean> = {};
    STATES.forEach((s) => {
      active[s.k] = true;
    });

    const fmtMoney = (n: number): string => {
      if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
      if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
      return '$' + Math.round(n);
    };
    const setFill = (el: HTMLInputElement): void => {
      const pct = ((Number(el.value) - Number(el.min)) / (Number(el.max) - Number(el.min))) * 100;
      el.style.setProperty('--fill', pct + '%');
    };
    const out = (id: string): HTMLElement => byId(id) as HTMLElement;

    // Build state chips
    STATES.forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'schip is-on';
      b.setAttribute('aria-pressed', 'true');
      b.setAttribute('aria-label', `${s.k} — toggle this state`);
      b.innerHTML = `${s.k}<small>$${Math.round(s.base / 1000)}K base</small>`;
      b.addEventListener('click', () => {
        active[s.k] = !active[s.k];
        b.classList.toggle('is-on', active[s.k]);
        b.setAttribute('aria-pressed', String(active[s.k]));
        compute();
      });
      chipsWrap.appendChild(b);
    });

    function compute(): void {
      const cap = parseFloat(capEl!.value) / 100;
      const margin = parseInt(marginEl!.value, 10) / 100;
      const includeTX = txEl!.checked;

      let revenue = 0;
      let students = 0;
      let saved = 0;
      let n = 0;
      STATES.forEach((s) => {
        if (!active[s.k]) return;
        n++;
        const st = s.fr * cap;
        students += st;
        revenue += st * s.fee;
        saved += st * s.net;
      });
      if (includeTX) {
        revenue += TX.rev;
        students += TX.students;
        saved += TX.saved;
      }

      const profit = revenue * margin;
      const months = profit > 0 ? (PRICE / profit) * 12 : Infinity;
      const cumulative = revenue * 3.75; // ramped to steady state over ~3 years

      out('capVal').textContent = parseFloat(capEl!.value) + '%';
      out('marginVal').textContent = marginEl!.value + '%';
      out('stateCount').textContent = n + ' of 6';
      out('oRev').textContent = fmtMoney(revenue);
      out('oProfit').textContent = fmtMoney(profit);
      out('oStudents').textContent = Math.round(students).toLocaleString();
      out('oCum').textContent = fmtMoney(cumulative);
      out('oSaved').textContent = fmtMoney(saved);

      const numEl = out('paybackNum');
      const subEl = out('paybackSub');
      const bar = out('paybackBar');
      if (profit <= 0) {
        numEl.textContent = '—';
        subEl.textContent = 'add a state or include Texas to begin';
        bar.style.width = '0%';
      } else {
        let label: string;
        if (months < 1) label = '< 1 month';
        else if (months <= 24) label = '≈ ' + Math.round(months) + ' months';
        else label = '≈ ' + (months / 12).toFixed(1) + ' years';
        numEl.textContent = label;
        subEl.textContent = 'of steady-state cash flow recoups the entire purchase price';
        bar.style.width = Math.max(4, Math.min(100, ((24 - months) / 24) * 100)) + '%';
      }
      setFill(capEl!);
      setFill(marginEl!);
    }

    const syncPresets = (matchVal: number | null): void => {
      presets.forEach((p) => {
        const cap = p.getAttribute('data-cap');
        const on = matchVal !== null && cap !== null && parseFloat(cap) === matchVal;
        p.classList.toggle('is-on', on);
        p.setAttribute('aria-pressed', String(on));
      });
    };
    capEl.addEventListener('input', () => {
      syncPresets(parseFloat(capEl.value));
      compute();
    });
    marginEl.addEventListener('input', compute);
    txEl.addEventListener('change', compute);
    presets.forEach((p) => {
      p.addEventListener('click', () => {
        const cap = p.getAttribute('data-cap');
        if (cap === null) return;
        capEl.value = cap;
        syncPresets(parseFloat(cap));
        compute();
      });
    });

    compute();
  })();
})();
