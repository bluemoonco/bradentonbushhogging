/* =============================================================
   Bradenton Bush-Hogging Co. — front-end behavior
   1. Lead form validation + async submit
   2. Spam friction (timestamp, honeypot is in the markup)
   3. Small UX: phone masking, year stamp, call-bar visibility
   ============================================================= */
(function () {
  'use strict';

  var form = document.getElementById('leadForm');
  var statusBox = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');
  var startedAt = document.getElementById('formStarted');

  /* current year in the footer */
  var yr = document.getElementById('yr');
  if (yr) { yr.textContent = new Date().getFullYear(); }

  /* time-on-page trap: bots post instantly, people don't */
  if (startedAt) { startedAt.value = String(Date.now()); }

  if (!form) { return; }

  /* ---------- validation rules ---------- */
  var rules = {
    name: {
      test: function (v) { return v.trim().length >= 2; },
      msg: 'Enter your name so we know who we\u2019re quoting.'
    },
    phone: {
      test: function (v) { return v.replace(/\D/g, '').length >= 10; },
      msg: 'Enter a 10-digit phone number we can reach you at.'
    },
    email: {
      test: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); },
      msg: 'Enter a valid email address \u2014 the quote goes here.'
    },
    address: {
      test: function (v) { return v.trim().length >= 5; },
      msg: 'Enter the property address, cross streets or parcel ID.'
    },
    message: {
      test: function (v) { return v.trim().length >= 5; },
      msg: 'Tell us briefly what you need cut.'
    }
  };

  function fieldWrap(input) { return input.closest('.field'); }

  function showError(input, msg) {
    var wrap = fieldWrap(input);
    var err = document.getElementById('err-' + input.id);
    if (wrap) { wrap.setAttribute('data-invalid', ''); }
    input.setAttribute('aria-invalid', 'true');
    if (err) { err.textContent = msg; err.hidden = false; }
  }

  function clearError(input) {
    var wrap = fieldWrap(input);
    var err = document.getElementById('err-' + input.id);
    if (wrap) { wrap.removeAttribute('data-invalid'); }
    input.removeAttribute('aria-invalid');
    if (err) { err.hidden = true; err.textContent = ''; }
  }

  function validateField(input) {
    var rule = rules[input.name];
    if (!rule) { return true; }
    if (rule.test(input.value)) { clearError(input); return true; }
    showError(input, rule.msg);
    return false;
  }

  /* validate on blur, forgive on input once the field is clean */
  Object.keys(rules).forEach(function (key) {
    var input = form.elements[key];
    if (!input) { return; }
    input.addEventListener('blur', function () { validateField(input); });
    input.addEventListener('input', function () {
      if (input.hasAttribute('aria-invalid') && rules[key].test(input.value)) {
        clearError(input);
      }
    });
  });

  /* ---------- phone formatting: (941) 555-0134 ---------- */
  var phone = form.elements.phone;
  if (phone) {
    phone.addEventListener('input', function () {
      var d = phone.value.replace(/\D/g, '').slice(0, 10);
      if (d.length > 6)      { phone.value = '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6); }
      else if (d.length > 3) { phone.value = '(' + d.slice(0, 3) + ') ' + d.slice(3); }
      else if (d.length > 0) { phone.value = '(' + d; }
      else                   { phone.value = ''; }
    });
  }

  /* ---------- status messaging ---------- */
  function setStatus(kind, title, body) {
    statusBox.innerHTML =
      '<div class="' + kind + '"><strong>' + title + '</strong>' + body + '</div>';
  }

  function busy(on) {
    if (on) { submitBtn.setAttribute('data-busy', ''); }
    else { submitBtn.removeAttribute('data-busy'); }
    submitBtn.disabled = !!on;
  }

  /* ---------- submit ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusBox.innerHTML = '';

    var firstBad = null;
    Object.keys(rules).forEach(function (key) {
      var input = form.elements[key];
      if (input && !validateField(input) && !firstBad) { firstBad = input; }
    });

    if (firstBad) {
      firstBad.focus();
      setStatus('bad', 'Check the highlighted fields',
        'A couple of details are missing \u2014 fix those and send it again.');
      return;
    }

    busy(true);

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(function (res) {
        /* Read as text first. If the server returns a 404 page, a PHP fatal
           error, or raw source, res.json() throws and we lose the evidence.
           Capturing the status and body makes the cause visible instead. */
        return res.text().then(function (raw) {
          try {
            var parsed = JSON.parse(raw);
            /* Hosted form services report success under different keys:
               Web3Forms uses `success`, Formspree uses `ok`. */
            if (parsed.success === true) { parsed.ok = true; }
            return parsed;
          } catch (e) {
            return {
              ok: false,
              _status: res.status,
              _raw: raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220)
            };
          }
        });
      })
      .then(function (data) {
        busy(false);

        if (data && data.ok) {
          form.reset();
          if (startedAt) { startedAt.value = String(Date.now()); }
          setStatus('ok', 'Request sent \u2014 thank you.',
            'Your quote request is in. We answer the same business day, ' +
            'Monday through Saturday. Need it faster? Call (941)&nbsp;909-BUSH.');
          statusBox.scrollIntoView({ block: 'center', behavior: 'smooth' });

          /* conversion hook — fires for GA4 / Google Ads if gtag is present */
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'generate_lead', {
              event_category: 'form',
              event_label: 'bradenton_quote_form'
            });
          }
        } else {
          var detail = '';
          if (data && data._status) {
            /* Non-JSON response: name the HTTP status so the cause is obvious. */
            if (data._status === 404) {
              detail = 'The form handler was not found on the server (404) \u2014 ' +
                       'form/submit.php is missing or in the wrong folder. ';
            } else if (data._status === 403) {
              detail = 'The server refused the request (403) \u2014 check file permissions. ';
            } else if (data._status >= 500) {
              detail = 'The form handler crashed (HTTP ' + data._status + '). ';
            } else if (data._raw && data._raw.indexOf('<?php') === 0) {
              detail = 'PHP is not running on this server. ';
            } else {
              detail = 'Unexpected response (HTTP ' + data._status + '). ';
            }
            if (data._raw) {
              /* Show what the server actually sent — the fastest way to
                 identify a stray warning or a misconfigured host. */
              detail += 'Server said: "' + data._raw.slice(0, 120) + '" ';
            }
            console.error('[form] HTTP ' + data._status + ' \u2014 body:', data._raw);
          } else if (data && data.error) {
            detail = data.error + ' ';
          }

          setStatus('bad', 'That didn\u2019t go through',
            detail +
            'Call or text <a href="tel:+19419092874">(941)&nbsp;909-BUSH</a> ' +
            'and we\u2019ll pick it up from there.');
        }
      })
      .catch(function () {
        busy(false);
        setStatus('bad', 'Connection problem',
          'The request didn\u2019t reach us. Call or text ' +
          '<a href="tel:+19419092874">(941)&nbsp;909-BUSH</a>.');
      });
  });

  /* ---------- hide the sticky call bar while the form is on screen ---------- */
  var quote = document.getElementById('quote');
  var callbar = document.querySelector('.callbar');
  if (quote && callbar && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        callbar.style.transform = entry.isIntersecting ? 'translateY(110%)' : 'translateY(0)';
      });
    }, { threshold: 0.35 }).observe(quote);
    callbar.style.transition = 'transform .25s ease';
  }

  /* ---------- click tracking hooks ---------- */
  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'cta_click', { event_label: el.getAttribute('data-track') });
      }
    });
  });
})();
