/* InstateMe main site — nav, savings calculator, scroll reveals.
   Compiled to assets/main.js via `npm run build`. */

(() => {
  'use strict';

  /* ---------- Sticky nav shadow ---------- */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = (): void => {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector<HTMLButtonElement>('.nav__toggle');
  const links = document.querySelector<HTMLUListElement>('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Scroll reveals ---------- */
  const revealed = document.querySelectorAll<HTMLElement>('.reveal');
  if (revealed.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    revealed.forEach((el) => io.observe(el));
  } else {
    revealed.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Savings calculator ---------- */
  interface School {
    name: string;
    outOfState: number; // per year
    inState: number; // per year
  }
  // Published rate estimates — update as schools revise tuition.
  const SCHOOLS: School[] = [
    { name: 'University of Texas at Austin', outOfState: 44000, inState: 11000 },
    { name: 'Texas A&M University', outOfState: 40000, inState: 13000 },
    { name: 'University of Utah', outOfState: 29854, inState: 9222 },
    { name: 'University of Arkansas', outOfState: 18914, inState: 6824 },
  ];

  const schoolSel = document.getElementById('calc-school') as HTMLSelectElement | null;
  const yearSel = document.getElementById('calc-year') as HTMLSelectElement | null;
  const outOos = document.getElementById('calc-oos');
  const outRes = document.getElementById('calc-res');
  const outSem = document.getElementById('calc-sem');
  const outYears = document.getElementById('calc-years');
  const outTotal = document.getElementById('calc-total');

  const fmt = (n: number): string =>
    '$' + Math.round(n).toLocaleString('en-US');

  const renderCalc = (): void => {
    if (!schoolSel || !yearSel || !outOos || !outRes || !outSem || !outTotal) return;
    const school = SCHOOLS[schoolSel.selectedIndex];
    const yearsRemaining = Number(yearSel.value); // years of savings after reclassification
    if (!school || !Number.isFinite(yearsRemaining)) return;
    const annual = school.outOfState - school.inState;
    outOos.textContent = fmt(school.outOfState / 2);
    outRes.textContent = fmt(school.inState / 2);
    outSem.textContent = fmt(annual / 2);
    outTotal.textContent = fmt(annual * yearsRemaining);
    if (outYears) {
      outYears.textContent = `(${yearsRemaining} year${yearsRemaining === 1 ? '' : 's'})`;
    }
  };

  if (schoolSel && yearSel) {
    for (const s of SCHOOLS) {
      const opt = document.createElement('option');
      opt.textContent = s.name;
      schoolSel.appendChild(opt);
    }
    schoolSel.addEventListener('change', renderCalc);
    yearSel.addEventListener('change', renderCalc);
    renderCalc();
  }

  /* ---------- Enrollment countdown + progress bar ---------- */
  // Counts down to the next September 1st, then rolls over to the
  // following year automatically. The bar fills across the 12-month cycle.
  const daysEl = document.getElementById('days-left');
  const barEl = document.getElementById('enroll-bar');
  if (daysEl) {
    const now = new Date();
    let deadline = new Date(now.getFullYear(), 8, 1); // Sep 1 this year, local time
    if (deadline.getTime() <= now.getTime()) {
      deadline = new Date(now.getFullYear() + 1, 8, 1);
    }
    const cycleStart = new Date(deadline.getFullYear() - 1, 8, 1);
    const days = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);
    daysEl.textContent = String(days);
    if (barEl) {
      const total = deadline.getTime() - cycleStart.getTime();
      const elapsed = now.getTime() - cycleStart.getTime();
      const pct = Math.min(96, Math.max(6, Math.round((elapsed / total) * 100)));
      barEl.style.width = pct + '%';
    }
  }

  /* ---------- State-rules map tooltip ---------- */
  const mapWrap = document.querySelector<HTMLElement>('.usmap-wrap');
  const tip = document.getElementById('map-tip');
  const tipName = document.getElementById('map-tip-name');
  const tipText = document.getElementById('map-tip-text');
  if (mapWrap && tip && tipName && tipText) {
    const lives = mapWrap.querySelectorAll<SVGAElement>('.map-live');
    lives.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        tipName.textContent = el.getAttribute('data-name');
        tipText.textContent = el.getAttribute('data-tip');
        tip.hidden = false;
      });
      el.addEventListener('mouseleave', () => {
        tip.hidden = true;
      });
      el.addEventListener('mousemove', (e: MouseEvent) => {
        const r = mapWrap.getBoundingClientRect();
        const x = Math.min(e.clientX - r.left + 16, r.width - 300);
        const y = e.clientY - r.top + 18;
        tip.style.left = Math.max(0, x) + 'px';
        tip.style.top = y + 'px';
      });
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
