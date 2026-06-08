/* InstateMe acquisition site — interactions */
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  var floatCta = document.getElementById('floatCta');
  var hero = document.getElementById('hero');

  /* ---- Sticky nav state (solid background once past the hero top) ---- */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (y > 40) nav.classList.add('is-stuck');
    else nav.classList.remove('is-stuck');

    // Floating CTA appears after the hero, hides near the access form
    var access = document.getElementById('access');
    var heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 600;
    var accessTop = access ? access.offsetTop - window.innerHeight : Infinity;
    if (y > heroBottom && y < accessTop) floatCta.classList.add('show');
    else floatCta.classList.remove('show');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  function closeMenu() {
    mobileMenu.classList.remove('open');
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }
  if (burger) {
    burger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---- On mobile, "Request access" jumps to the form, not the section heading ---- */
  document.querySelectorAll('a[href="#access"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (window.innerWidth <= 860) {
        var formEl = document.getElementById('reqform');
        if (formEl) {
          e.preventDefault();
          formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (history.replaceState) history.replaceState(null, '', '#access');
        }
      }
    });
  });

  /* ---- Reveal-on-scroll + trigger bar/chart fills ---- */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealTargets = document.querySelectorAll(
    '.reveal, .fin__chart, .model, .ask__bridge, .bars, .model__bars'
  );

  if ('IntersectionObserver' in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- Count-up for the "86" stat ---- */
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !prefersReduced) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var start = null;
        var dur = 1100;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---- Request-access form → emails jsilver@instateme.com (FormSubmit AJAX) ---- */
  var form = document.getElementById('reqform');
  if (form) {
    // POSTs to FormSubmit, which forwards the submission as an email.
    var ENDPOINT = 'https://formsubmit.co/ajax/jsilver@instateme.com';
    var statusEl = document.getElementById('reqStatus');
    var submitBtn = document.getElementById('reqSubmit');

    function setStatus(kind, msg) {
      if (!statusEl) return;
      statusEl.hidden = !msg;
      statusEl.textContent = msg || '';
      statusEl.className = 'reqform__status' + (kind ? ' ' + kind : '');
    }

    function mailtoFallback(name, email, thesis, pof) {
      var subject = 'InstateMe — Data room request (' + name + ')';
      var body =
        'Name: ' + name + '\nEmail: ' + email +
        '\nProof of funds: ' + pof +
        '\n\nAcquisition thesis:\n' + (thesis || '(to discuss on a call)');
      window.location.href =
        'mailto:jsilver@instateme.com?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot — silently drop bots.
      var honey = form.elements['_honey'];
      if (honey && honey.value) return;

      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var thesis = (data.get('thesis') || '').toString().trim();
      var pof = data.get('pof') ? 'Yes' : 'Not indicated';

      if (!name || !email) {
        var miss = form.querySelector('input[name="' + (name ? 'email' : 'name') + '"]');
        if (miss) miss.focus();
        return;
      }

      var orig = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      setStatus('', '');

      var payload = {
        name: name,
        email: email,
        'Acquisition thesis': thesis || '(to discuss on a call)',
        'Proof of funds': pof,
        _subject: 'InstateMe data-room request — ' + name,
        _template: 'table',
        _captcha: 'false'
      };

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.ok ? r.json().catch(function(){return {};}) : Promise.reject(r); })
        .then(function () {
          form.reset();
          setStatus('ok', 'Thanks — your request is in. Jake will reply within 24 hours.');
        })
        .catch(function () {
          // If the request fails, fall back to the buyer's email client so nothing is lost.
          setStatus('err', 'Opening your email app to send this directly…');
          mailtoFallback(name, email, thesis, pof);
        })
        .then(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = orig; }
        });
    });
  }

  /* ---- Market opportunity calculator ---- */
  (function () {
    var capEl = document.getElementById('capture');
    if (!capEl) return;
    var marginEl = document.getElementById('margin');
    var txEl = document.getElementById('txBase');
    var chipsWrap = document.getElementById('stateChips');
    var presets = document.querySelectorAll('.preset');
    var PRICE = 1000000;

    // Per-state model (from the market-sizing workbook): freshmen/yr, fee = one-semester gap, net savings/student.
    var STATES = [
      { k: 'AR', fr: 3565.0192, fee: 8114.59, net: 48687.56, base: 578574 },
      { k: 'UT', fr: 4504.8076, fee: 8668.17, net: 43340.87, base: 780969 },
      { k: 'NV', fr: 2469.4512, fee: 8076.82, net: 40384.10, base: 398906 },
      { k: 'NM', fr: 1661.494,  fee: 7919.05, net: 39595.24, base: 263149 },
      { k: 'ND', fr: 2849.6947, fee: 2275.11, net: 11375.55, base: 129667 },
      { k: 'SD', fr: 1683.6535, fee: 1721.86, net: 8609.30,  base: 57980  }
    ];
    var TX = { rev: 389000, students: 24, saved: 24 * 99000 };
    var active = {};
    STATES.forEach(function (s) { active[s.k] = true; });

    function fmtMoney(n) {
      if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
      if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
      return '$' + Math.round(n);
    }
    function setFill(el) {
      var pct = (el.value - el.min) / (el.max - el.min) * 100;
      el.style.setProperty('--fill', pct + '%');
    }
    function $(id) { return document.getElementById(id); }

    // Build state chips
    STATES.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'schip is-on';
      b.setAttribute('aria-pressed', 'true');
      b.setAttribute('aria-label', s.k + ' — toggle this state');
      b.innerHTML = s.k + '<small>$' + Math.round(s.base / 1000) + 'K base</small>';
      b.addEventListener('click', function () {
        active[s.k] = !active[s.k];
        b.classList.toggle('is-on', active[s.k]);
        b.setAttribute('aria-pressed', String(active[s.k]));
        compute();
      });
      chipsWrap.appendChild(b);
    });

    function compute() {
      var cap = parseFloat(capEl.value) / 100;
      var margin = parseInt(marginEl.value, 10) / 100;
      var includeTX = txEl.checked;

      var revenue = 0, students = 0, saved = 0, n = 0;
      STATES.forEach(function (s) {
        if (!active[s.k]) return;
        n++;
        var st = s.fr * cap;
        students += st;
        revenue += st * s.fee;
        saved += st * s.net;
      });
      if (includeTX) { revenue += TX.rev; students += TX.students; saved += TX.saved; }

      var profit = revenue * margin;
      var months = profit > 0 ? PRICE / profit * 12 : Infinity;
      var cumulative = revenue * 3.75; // ramped to steady state over ~3 years

      $('capVal').textContent = parseFloat(capEl.value) + '%';
      $('marginVal').textContent = marginEl.value + '%';
      $('stateCount').textContent = n + ' of 6';
      $('oRev').textContent = fmtMoney(revenue);
      $('oProfit').textContent = fmtMoney(profit);
      $('oStudents').textContent = Math.round(students).toLocaleString();
      $('oCum').textContent = fmtMoney(cumulative);
      $('oSaved').textContent = fmtMoney(saved);

      var numEl = $('paybackNum'), subEl = $('paybackSub'), bar = $('paybackBar');
      if (profit <= 0) {
        numEl.textContent = '—';
        subEl.textContent = 'add a state or include Texas to begin';
        bar.style.width = '0%';
      } else {
        var label;
        if (months < 1) label = '< 1 month';
        else if (months <= 24) label = '≈ ' + Math.round(months) + ' months';
        else label = '≈ ' + (months / 12).toFixed(1) + ' years';
        numEl.textContent = label;
        subEl.textContent = 'of steady-state cash flow recoups the entire purchase price';
        bar.style.width = Math.max(4, Math.min(100, (24 - months) / 24 * 100)) + '%';
      }
      setFill(capEl);
      setFill(marginEl);
    }

    function syncPresets(matchVal) {
      presets.forEach(function (p) {
        var on = matchVal !== null && parseFloat(p.getAttribute('data-cap')) === matchVal;
        p.classList.toggle('is-on', on);
        p.setAttribute('aria-pressed', String(on));
      });
    }
    capEl.addEventListener('input', function () {
      syncPresets(parseFloat(capEl.value));
      compute();
    });
    marginEl.addEventListener('input', compute);
    txEl.addEventListener('change', compute);
    presets.forEach(function (p) {
      p.addEventListener('click', function () {
        capEl.value = p.getAttribute('data-cap');
        syncPresets(parseFloat(p.getAttribute('data-cap')));
        compute();
      });
    });

    compute();
  })();
})();
