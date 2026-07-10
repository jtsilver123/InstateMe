"use strict";
/* InstateMe main site — nav, savings calculator, scroll reveals.
   Compiled to assets/main.js via `npm run build`. */
(() => {
    'use strict';
    /* ---------- Sticky nav shadow ---------- */
    const nav = document.getElementById('nav');
    if (nav) {
        const onScroll = () => {
            nav.classList.toggle('is-scrolled', window.scrollY > 8);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }
    /* ---------- Mobile menu ---------- */
    const toggle = document.querySelector('.nav__toggle');
    const links = document.querySelector('.nav__links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            const open = links.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        links.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                links.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
    /* ---------- Scroll reveals ---------- */
    const revealed = document.querySelectorAll('.reveal');
    if (revealed.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            }
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        revealed.forEach((el) => io.observe(el));
    }
    else {
        revealed.forEach((el) => el.classList.add('is-visible'));
    }
    // Published rate estimates — update as schools revise tuition.
    const SCHOOLS = [
        { name: 'University of Texas at Austin', outOfState: 44000, inState: 11000 },
        { name: 'Texas A&M University', outOfState: 40000, inState: 13000 },
        { name: 'University of Utah', outOfState: 29854, inState: 9222 },
        { name: 'University of Arkansas', outOfState: 18914, inState: 6824 },
    ];
    const schoolSel = document.getElementById('calc-school');
    const yearSel = document.getElementById('calc-year');
    const outOos = document.getElementById('calc-oos');
    const outRes = document.getElementById('calc-res');
    const outSem = document.getElementById('calc-sem');
    const outYears = document.getElementById('calc-years');
    const outTotal = document.getElementById('calc-total');
    const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
    const renderCalc = () => {
        if (!schoolSel || !yearSel || !outOos || !outRes || !outSem || !outTotal)
            return;
        const school = SCHOOLS[schoolSel.selectedIndex];
        const yearsRemaining = Number(yearSel.value); // years of savings after reclassification
        if (!school || !Number.isFinite(yearsRemaining))
            return;
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
    // Last realistic date to start a 12-month residency clock for Fall '27.
    const ENROLL_START = new Date('2026-01-01T00:00:00-06:00');
    const ENROLL_DEADLINE = new Date('2026-12-09T00:00:00-06:00');
    const daysEl = document.getElementById('days-left');
    const barEl = document.getElementById('enroll-bar');
    if (daysEl) {
        const days = Math.ceil((ENROLL_DEADLINE.getTime() - Date.now()) / 86400000);
        if (days > 0) {
            daysEl.textContent = String(days);
            if (barEl) {
                const total = ENROLL_DEADLINE.getTime() - ENROLL_START.getTime();
                const elapsed = Date.now() - ENROLL_START.getTime();
                const pct = Math.min(96, Math.max(6, Math.round((elapsed / total) * 100)));
                barEl.style.width = pct + '%';
            }
        }
        else {
            const wrap = daysEl.closest('.jakebar-wrap');
            const meta = wrap && wrap.querySelector('.jakebar__meta');
            const bar = wrap && wrap.querySelector('.jakebar__bar');
            if (meta && meta.parentElement)
                meta.parentElement.removeChild(meta);
            if (bar && bar.parentElement)
                bar.parentElement.removeChild(bar);
        }
    }
    /* ---------- State-rules map tooltip ---------- */
    const mapWrap = document.querySelector('.usmap-wrap');
    const tip = document.getElementById('map-tip');
    const tipName = document.getElementById('map-tip-name');
    const tipText = document.getElementById('map-tip-text');
    if (mapWrap && tip && tipName && tipText) {
        const lives = mapWrap.querySelectorAll('.map-live');
        lives.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                tipName.textContent = el.getAttribute('data-name');
                tipText.textContent = el.getAttribute('data-tip');
                tip.hidden = false;
            });
            el.addEventListener('mouseleave', () => {
                tip.hidden = true;
            });
            el.addEventListener('mousemove', (e) => {
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
    if (yearEl)
        yearEl.textContent = String(new Date().getFullYear());
})();
