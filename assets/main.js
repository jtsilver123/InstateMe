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
    // Enrollment runs by semester and closes on the census date: the earlier
    // of UT Austin's and Texas A&M's for each term. Counts down to the next
    // census date, labels the term, and fills the bar across the window
    // since the previous one.
    //   Fall '26   Sep 9  (UT Sep 9, TAMU Sep 9)
    //   Spring '27 Jan 27 (UT Jan 27, TAMU Feb 3)
    //   Fall '27   Sep 8  (UT 12th class day from Aug 23 start; TAMU not yet published)
    //   Spring '28 Feb 2  (UT 12th class day from Jan 18 start; TAMU not yet published)
    // Later terms fall back to Jan 27 / Sep 9 — update this list each year.
    const daysEl = document.getElementById('days-left');
    const barEl = document.getElementById('enroll-bar');
    const termEl = document.getElementById('enroll-term');
    if (daysEl) {
        const now = new Date();
        const census = [
            new Date(2026, 8, 9),
            new Date(2027, 0, 27),
            new Date(2027, 8, 8),
            new Date(2028, 1, 2),
        ];
        for (let y = 2028; y <= now.getFullYear() + 1; y++) {
            census.push(new Date(y, 8, 9), new Date(y + 1, 0, 27));
        }
        // Sign-ups stay open through the end of census day (local time).
        const closes = census.map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
        let i = closes.findIndex((d) => d.getTime() > now.getTime());
        if (i < 0)
            i = closes.length - 1;
        const deadline = closes[i];
        const cycleStart = i > 0 ? closes[i - 1] : new Date(2026, 0, 28);
        const days = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);
        daysEl.textContent = String(days);
        if (termEl) {
            const term = census[i].getMonth() < 6 ? 'Spring' : 'Fall';
            termEl.textContent = term + " '" + String(census[i].getFullYear()).slice(-2);
        }
        if (barEl) {
            const total = deadline.getTime() - cycleStart.getTime();
            const elapsed = now.getTime() - cycleStart.getTime();
            const pct = Math.min(96, Math.max(6, Math.round((elapsed / total) * 100)));
            barEl.style.width = pct + '%';
        }
    }
    /* ---------- State-rules map tooltip ---------- */
    const mapWrap = document.querySelector('.usmap-wrap');
    const tip = document.getElementById('map-tip');
    const tipName = document.getElementById('map-tip-name');
    const tipText = document.getElementById('map-tip-text');
    const tipTier = document.getElementById('map-tip-tier');
    if (mapWrap && tip && tipName && tipText) {
        const lives = mapWrap.querySelectorAll('.map-live');
        lives.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                tipName.textContent = el.getAttribute('data-name');
                tipText.textContent = el.getAttribute('data-tip');
                if (tipTier)
                    tipTier.textContent = el.getAttribute('data-tier') || '';
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
