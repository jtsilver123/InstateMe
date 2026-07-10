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
    const outAnnual = document.getElementById('calc-annual');
    const outRates = document.getElementById('calc-rates');
    const outTotal = document.getElementById('calc-total');
    const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
    const renderCalc = () => {
        if (!schoolSel || !yearSel || !outAnnual || !outTotal || !outRates)
            return;
        const school = SCHOOLS[schoolSel.selectedIndex];
        const yearsRemaining = Number(yearSel.value); // years of savings after reclassification
        if (!school || !Number.isFinite(yearsRemaining))
            return;
        const annual = school.outOfState - school.inState;
        outRates.textContent = `${fmt(school.outOfState)} out-of-state vs ${fmt(school.inState)} in-state`;
        outAnnual.textContent = `${fmt(annual)} / year`;
        outTotal.textContent = fmt(annual * yearsRemaining);
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
    /* ---------- Deadline countdown ---------- */
    // Most 12-month residency clocks for Fall '27 need to start by this date.
    const DEADLINE = new Date('2026-12-15T00:00:00-06:00');
    const daysEl = document.getElementById('days-left');
    if (daysEl) {
        const days = Math.ceil((DEADLINE.getTime() - Date.now()) / 86400000);
        if (days > 0) {
            daysEl.textContent = `${days} days left to start`;
        }
        else if (daysEl.parentElement) {
            daysEl.parentElement.removeChild(daysEl);
        }
    }
    /* ---------- Footer year ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl)
        yearEl.textContent = String(new Date().getFullYear());
})();
