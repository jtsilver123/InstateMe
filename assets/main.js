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
    /* ---------- Footer year ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl)
        yearEl.textContent = String(new Date().getFullYear());
})();
