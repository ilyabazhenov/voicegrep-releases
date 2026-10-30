// Guide pages (/ru/<slug>/, /changelog/): the landing's theme toggle (same vg.landing.theme key, so the
// choice carries between pages), "send the link to your Mac" on phones, and FAQ deep links.
// The pre-paint part (touch class, stored theme) is inline in each page's <head>.
(function () {
  'use strict';
  var root = document.documentElement, KEY = 'vg.landing.theme';
  var mq = window.matchMedia && matchMedia('(prefers-color-scheme: dark)');
  function sys() { return mq && mq.matches ? 'dark' : 'light'; }
  function apply(t) {
    root.setAttribute('data-theme', t);
    var m = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < m.length; i++) m[i].setAttribute('content', t === 'dark' ? '#0e0f12' : '#f7f5f0');
    var b = document.querySelectorAll('.js-theme');
    for (var j = 0; j < b.length; j++) b[j].setAttribute('aria-pressed', String(t === 'dark'));
  }
  function saved() {
    try { var v = localStorage.getItem(KEY); return v === 'dark' || v === 'light' ? v : null; } catch (e) { return null; }
  }
  apply(saved() || sys());
  if (mq) {
    var onSys = function () { apply(saved() || sys()); };
    if (mq.addEventListener) mq.addEventListener('change', onSys); else if (mq.addListener) mq.addListener(onSys);
  }
  window.addEventListener('storage', function (e) { if (e.key === KEY || e.key === null) apply(saved() || sys()); });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.js-theme');
    if (btn) {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      // flipping back to the system's own theme forgets the choice, as on the landing
      try { if (next === sys()) localStorage.removeItem(KEY); else localStorage.setItem(KEY, next); } catch (e2) {}
      apply(next);
      return;
    }
    var share = e.target.closest && e.target.closest('.js-share');
    if (share) shareLink(share);
  });

  // Phones can't run a Mac app: share or copy the page link instead of downloading.
  function shareLink(b) {
    var url = location.origin + location.pathname;
    var ask = root.lang === 'en' ? 'Copy the link' : 'Скопируйте ссылку';
    var lbl = b.querySelector('.lbl') || b;
    var flash = function () {
      var orig = b.getAttribute('data-orig') || lbl.textContent;
      b.setAttribute('data-orig', orig);
      lbl.textContent = b.getAttribute('data-done') || orig;
      clearTimeout(b._t); b._t = setTimeout(function () { lbl.textContent = orig; }, 1800);
    };
    var copy = function () {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(flash, function () { window.prompt(ask, url); });
      else window.prompt(ask, url);
    };
    if (navigator.share) navigator.share({ title: document.title, url: url }).catch(function (err) { if (!err || err.name !== 'AbortError') copy(); });
    else copy();
  }

  // A link to a question (#faq-…) opens its <details>: Safari doesn't on fragment navigation.
  function openQA() {
    var d = location.hash && document.getElementById(location.hash.slice(1));
    if (d && d.tagName === 'DETAILS') d.open = true;
  }
  openQA();
  window.addEventListener('hashchange', openQA);
})();
