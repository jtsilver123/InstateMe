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

  /* ---- Request-access form → composes an email to Jake (no backend) ---- */
  var form = document.getElementById('reqform');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var thesis = (data.get('thesis') || '').toString().trim();
      var pof = data.get('pof') ? 'Yes' : 'Not indicated';

      if (!name || !email) {
        form.querySelector('input[name="' + (name ? 'email' : 'name') + '"]').focus();
        return;
      }

      var subject = 'InstateMe — Data room request (' + name + ')';
      var body =
        'Hi Jake,\n\n' +
        'I\'d like to request the InstateMe data room and NDA.\n\n' +
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Proof of funds / committed capital: ' + pof + '\n\n' +
        'Acquisition thesis:\n' + (thesis || '(to discuss on a call)') + '\n\n' +
        'Thanks,\n' + name;

      window.location.href =
        'mailto:jsilver@instateme.com?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(body);
    });
  }

  /* ---- Footer year (if needed elsewhere) ---- */
  // no-op placeholder for future analytics hook
})();
