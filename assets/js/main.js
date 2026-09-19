/* =========================================================
   BHŪ RISE VENTURES — Interactions
   Sticky header · mobile nav · scroll reveals · counters · parallax
   Vanilla JS, no dependencies. Progressive-enhancement friendly.
   ========================================================= */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: shrink + hide-on-scroll-down ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var lastY = window.pageYOffset;
    var ticking = false;
    function onScroll() {
      var y = window.pageYOffset;
      header.classList.toggle('is-scrolled', y > 40);
      // hide when scrolling down past the hero, show on scroll up
      if (y > 480) {
        if (y > lastY + 6) header.classList.add('is-hidden');
        else if (y < lastY - 6) header.classList.remove('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector('.burger');
  var mobileNav = document.querySelector('.mobile-nav');
  if (burger && mobileNav) {
    function toggleNav(open) {
      var isOpen = open === undefined ? !mobileNav.classList.contains('open') : open;
      mobileNav.classList.toggle('open', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    }
    burger.addEventListener('click', function () { toggleNav(); });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { toggleNav(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') toggleNav(false);
    });
  }

  /* ---------- Scroll reveals ---------- */
  var revealEls = document.querySelectorAll('[data-reveal], .reveal-lines');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = (el.getAttribute('data-decimals')) ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
    var dur = 1600;
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCount);
    } else {
      var cio = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- Hero parallax (subtle) ---------- */
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    var pTicking = false;
    window.addEventListener('scroll', function () {
      if (pTicking) return;
      pTicking = true;
      window.requestAnimationFrame(function () {
        var y = window.pageYOffset;
        parallaxEls.forEach(function (el) {
          var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
          el.style.transform = 'translate3d(0,' + (y * speed) + 'px,0)';
        });
        pTicking = false;
      });
    }, { passive: true });
  }

  /* ---------- Expandable leadership bios ---------- */
  var bioToggles = document.querySelectorAll('.bio-toggle');
  bioToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var more = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      if (more) more.hidden = open;
      btn.setAttribute('aria-expanded', String(!open));
      btn.firstChild.nodeValue = open ? 'Read full profile ' : 'Show less ';
    });
  });

  /* ---------- Footer year ---------- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Contact form (AJAX submit → email via Web3Forms) ---------- */
  var form = document.getElementById('contact-form');
  if (form && form.getAttribute('action')) {
    var statusEl = form.querySelector('.form-status');
    var setStatus = function (msg, color) { if (statusEl) { statusEl.textContent = msg; statusEl.style.color = color; } };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      setStatus('Sending…', 'var(--text-soft)');
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; });
      }).then(function (res) {
        if (res.ok && (res.j.success === true || String(res.j.success) === 'true')) {
          form.reset();
          setStatus('Thank you — your enquiry has been sent. We’ll get back to you within one business day.', 'var(--brass)');
        } else {
          setStatus((res.j && res.j.message) ? res.j.message : 'Sorry, something went wrong. Please email info@bhurise.com directly.', '#a3403a');
        }
      }).catch(function () {
        setStatus('Sorry, something went wrong. Please email info@bhurise.com directly.', '#a3403a');
      }).then(function () { if (btn) btn.disabled = false; });
    });
  }
})();
