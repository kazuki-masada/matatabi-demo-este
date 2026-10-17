/* Sunday Tea（エステサロン・制作サンプル） main.js
   - ハンバーガーメニューの開閉
   - トップ：ファーストビューを過ぎたら画面下の固定ボタンを表示
   - 電話をかけるボタン（サンプルのため発信しない）
   - 予約フォームの入力チェックとダミー送信（どこにも送信しない）
   外部ライブラリは使いません。 */
(function () {
  'use strict';

  /* ---------- スクロールで現れる・画像の切り抜きで現れる ----------
     ①CSS のスクロール連動（animation-timeline: view()）に対応していれば、CSS に任せる（html に sdt）
     ②対応していなければ IntersectionObserver で is-visible をつける（html に js）
     最初から画面に見えている所は動かさない。「動きを減らす」設定の人には何もしない */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supportsScrollTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');
  var reveals = document.querySelectorAll('.reveal, .reveal-clip');
  if (reveals.length && !reduceMotion) {
    if (supportsScrollTimeline) {
      document.documentElement.classList.add('sdt');
    } else if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('is-visible');
        } else {
          revealObserver.observe(el);
        }
      });
      document.documentElement.classList.add('js');
    }
  }

  /* 1文字ずつ浮かぶ見出しと、最初の画面の絵のパララックスは、2026-10-08 の辛口審査の直しで外した（動きは4種類まで） */

  /* ---------- お部屋の絵の帯：止めるボタン ----------
     自動で動くものは止められるようにする。「動きを減らす」設定の人には、最初から動かさない（CSS）ので、ボタンも出さない */
  var loopButton = document.querySelector('[data-loop-toggle]');
  var loops = document.querySelectorAll('[data-loop]');
  if (loopButton && loops.length) {
    if (reduceMotion) {
      loopButton.parentNode.hidden = true;
    } else {
      loopButton.addEventListener('click', function () {
        var paused = loopButton.getAttribute('data-paused') !== 'true';
        loops.forEach(function (loop) { loop.classList.toggle('is-paused', paused); });
        loopButton.setAttribute('data-paused', paused ? 'true' : 'false');
        loopButton.textContent = paused ? '流れを再開する' : '流れを止める';
      });
    }
  }

  /* ---------- ハンバーガーメニュー ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('global-nav');
  var pcQuery = window.matchMedia('(min-width: 1024px)');

  var header = document.querySelector(".site-header");

  function setMenu(open) {
    if (!toggle || !nav) return;
    // お知らせ帯の高さが変わっても、メニューがヘッダーのすぐ下から開くようにする
    if (header) nav.style.top = header.offsetHeight + "px";
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('is-menu-open', open);
    // メニューを開いている間は、裏のページにキーボードや読み上げで入らないようにする
    document.querySelectorAll('main, footer, .fixed-cta, .skip-link').forEach(function (el) {
      if (open) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    pcQuery.addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- スマホの画面下の固定ボタン ----------
     同じ予約のボタンが画面に見えている間（トップの最初の画面・予約のまとめの章・フッター）は隠して、二重に見せない */
  var fixedCta = document.querySelector('.fixed-cta');
  if (fixedCta && 'IntersectionObserver' in window) {
    var watchTargets = [];
    if (fixedCta.hasAttribute('data-hide-on-hero')) {
      var heroEl = document.querySelector('.hero');
      if (heroEl) watchTargets.push(heroEl);
    }
    document.querySelectorAll('.cta, .site-footer').forEach(function (el) { watchTargets.push(el); });
    var visibleSet = new Set();
    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visibleSet.add(entry.target);
        else visibleSet.delete(entry.target);
      });
      fixedCta.classList.toggle('is-hidden', visibleSet.size > 0);
    });
    watchTargets.forEach(function (el) { ctaObserver.observe(el); });
  }

  /* ---------- 電話をかけるボタン（サンプルのため発信しない） ---------- */
  // 実際のサイトでは <a href="tel:..."> にして、タップで電話をかける画面が開くようにする
  var SAMPLE_TEL_MESSAGE = 'このサイトは制作サンプルのため、電話はかかりません。実際のサイトでは、ここをタップすると電話をかける画面が開きます。';
  document.querySelectorAll('[data-sample-tel]').forEach(function (button) {
    button.addEventListener('click', function () {
      var telStatus = document.getElementById(button.getAttribute('aria-describedby'));
      if (telStatus) telStatus.textContent = SAMPLE_TEL_MESSAGE;
    });
  });

  /* ---------- SNS のボタン（サンプルのため移動しない） ---------- */
  // 実際のサイトでは <a href="https://www.instagram.com/（アカウント名）/"> などにする。
  // 公式マークを使うときは、各社のブランドの決まりに沿う（docs/review-notes.md）
  document.querySelectorAll('[data-sample-sns]').forEach(function (button) {
    button.addEventListener('click', function () {
      var status = document.getElementById(button.getAttribute('aria-describedby'));
      var name = button.getAttribute('data-sample-sns');
      if (status) {
        status.textContent = 'サンプルのため移動しません。実際のサイトでは、ここからサロンの ' + name + ' のページが開きます。';
      }
    });
  });

  /* ---------- 入力エラーの表示（予約の見本・質問フォームで共通） ---------- */
  function showError(errorId, message, invalidEls) {
    var el = document.getElementById(errorId);
    el.textContent = message;
    el.hidden = false;
    invalidEls.forEach(function (input) {
      input.setAttribute('aria-invalid', 'true');
    });
  }

  function clearError(errorId, invalidEls) {
    var el = document.getElementById(errorId);
    el.textContent = '';
    el.hidden = true;
    invalidEls.forEach(function (input) {
      input.removeAttribute('aria-invalid');
    });
  }

  function countDigits(text) {
    var m = text.replace(/[０-９]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
    }).match(/[0-9]/g);
    return m ? m.length : 0;
  }

  /* ---------- 予約の見本 ----------
     ・入力した内容は、どこにも送らず、保存もしない（localStorage・sessionStorage・Cookie も使わない）
     ・空き状況は、日付から決まった計算で出す見本（実際の予約状況ではない）
     ・最後の画面を出したら、入力した内容を消す */
  var bookingForm = document.getElementById('booking-form');
  if (bookingForm) initBooking(bookingForm);

  function initBooking(form) {
    var MENUS = {
      f60: { label: 'フェイシャル 60分', min: 60, price: 8800, lastStart: 17 * 60 + 30 },
      f90: { label: 'フェイシャル 90分', min: 90, price: 12100, lastStart: 17 * 60 },
      h30: { label: '首まわりと手のお手入れ 30分', min: 30, price: 4400, lastStart: 17 * 60 + 30 }
    };
    var OPEN = 10 * 60;      // 10:00 開店
    var CLOSE = 19 * 60;     // 19:00 閉店
    var STEP = 30;           // 30分ごとの枠
    var CLOSED_DAY = 3;      // 水曜定休
    var RANGE_DAYS = 61;     // 明日から2か月先まで
    var WEEK = ['日', '月', '火', '水', '木', '金', '土'];
    var STATUS = {
      open: { mark: '○', label: '空きあり' },
      few: { mark: '△', label: '残りわずか' },
      full: { mark: '×', label: '満席のため選べません' },
      closed: { mark: '休', label: '定休日のため選べません' },
      out: { mark: '', label: '予約の見本の期間外のため選べません' }
    };

    var panels = Array.prototype.slice.call(form.querySelectorAll('.booking-panel'));
    var marks = Array.prototype.slice.call(document.querySelectorAll('.booking-steps li'));
    var calBody = document.getElementById('cal-body');
    var monthLabel = document.getElementById('cal-month');
    var prevBtn = form.querySelector('[data-cal-prev]');
    var nextBtn = form.querySelector('[data-cal-next]');
    var pickedDate = document.getElementById('b-picked-date');
    var pickedTime = document.getElementById('b-picked-time');
    var slotList = document.getElementById('b-slots');
    var slotLead = document.getElementById('b-slot-lead');
    var confirmList = document.getElementById('b-confirm');
    var nameInput = document.getElementById('b-name');
    var telInput = document.getElementById('b-tel');
    var emailInput = document.getElementById('b-email');
    var noteInput = document.getElementById('b-note');
    var privacyCheck = document.getElementById('b-privacy');

    var today = startOfDay(new Date());
    var minDate = addDays(today, 1);
    var maxDate = addDays(today, RANGE_DAYS);

    var state;
    var current = 1;
    var viewMonth;

    /* 日付のための小さな道具 */
    function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
    function sameDay(a, b) { return !!a && !!b && a.getTime() === b.getTime(); }
    function toKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    function fromKey(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
    function fmtDate(d) { return (d.getMonth() + 1) + '月' + d.getDate() + '日（' + WEEK[d.getDay()] + '）'; }
    function fmtTime(m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
    function yen(n) { return n.toLocaleString('ja-JP') + '円'; }

    function resetState() {
      state = { menu: null, first: null, date: null, time: null };
    }

    /* 予約の枠に何分とるか：お手入れ（お着替えを含む）＋お茶の時間15分。はじめての方は、お話の時間15分を足す */
    var TEA = 15;
    function duration() {
      return MENUS[state.menu].min + TEA + (state.first === 'yes' ? 15 : 0);
    }

    /* 見本の予約状況：日付から決まった計算で、1日に2〜3件の予約（1件は60〜90分）が入っている形にする
       （同じ日付なら、いつ開いても同じ結果になる。実際の予約状況ではない） */
    function bookedBlocks(d) {
      var seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
      var count = (CLOSE - OPEN) / STEP;
      var list = [];
      var i;
      for (i = 0; i < count; i++) list.push(false);
      if (seed % 10 === 3) {
        for (i = 0; i < count; i++) list[i] = true; // 満席の日
        return list;
      }
      var r = seed;
      function rand(n) {
        r = (r * 9301 + 49297) % 233280;
        return Math.floor((r / 233280) * n);
      }
      var bookings = 2 + rand(2);
      for (var b = 0; b < bookings; b++) {
        var len = 2 + rand(2);
        var start = rand(count - len + 1);
        for (i = start; i < start + len; i++) list[i] = true;
      }
      return list;
    }

    /* その日に始められる時間の一覧（お手入れの時間ぶん、枠が続けて空いていること） */
    function slotsFor(d) {
      var blocks = bookedBlocks(d);
      var need = Math.ceil(duration() / STEP);
      var result = [];
      for (var t = OPEN; t <= MENUS[state.menu].lastStart; t += STEP) {
        var i = (t - OPEN) / STEP;
        var free = true;
        for (var k = 0; k < need; k++) {
          if (i + k >= blocks.length || blocks[i + k]) { free = false; break; }
        }
        result.push({ start: t, free: free });
      }
      return result;
    }

    function dayStatus(d) {
      if (d < minDate || d > maxDate) return 'out';
      if (d.getDay() === CLOSED_DAY) return 'closed';
      var n = slotsFor(d).filter(function (s) { return s.free; }).length;
      if (n === 0) return 'full';
      if (n <= 3) return 'few';
      return 'open';
    }

    function isSelectable(d) {
      var st = dayStatus(d);
      return st === 'open' || st === 'few';
    }

    /* 進みぐあいの表示と、パネルの切り替え */
    function goTo(n, options) {
      var focus = !options || options.focus !== false;
      current = n;
      panels.forEach(function (p) {
        p.hidden = Number(p.getAttribute('data-step')) !== n;
      });
      marks.forEach(function (li) {
        var m = Number(li.getAttribute('data-mark'));
        li.classList.toggle('is-done', m < n);
        if (m === n) li.setAttribute('aria-current', 'step');
        else li.removeAttribute('aria-current');
      });

      if (n === 2) {
        var base = state.date || minDate;
        viewMonth = new Date(base.getFullYear(), base.getMonth(), 1);
        renderCalendar();
        updatePickedDate();
      }
      if (n === 3) renderSlots();
      if (n === 5) renderConfirm();
      if (n === 6) clearAll();

      if (focus) {
        var panel = panels[n - 1];
        var title = panel.querySelector('.booking-panel__title');
        title.focus({ preventScroll: true });
        title.scrollIntoView({ block: 'start' });
      }
    }

    /* ① メニュー */
    form.addEventListener('change', function (e) {
      if (e.target.name === 'b-menu' || e.target.name === 'b-first') {
        state.menu = (form.querySelector('input[name="b-menu"]:checked') || {}).value || null;
        state.first = (form.querySelector('input[name="b-first"]:checked') || {}).value || null;
        // メニューが変わると、かかる時間が変わるので、選んだ時間は選び直してもらう
        state.time = null;
        if (state.date && state.menu && state.first && !isSelectable(state.date)) state.date = null;
        clearError('b-error-1', []);
      }
    });

    function checkStep1() {
      if (!state.menu || !state.first) {
        showError('b-error-1', !state.menu ? 'メニューを選んでください' : 'はじめてのご来店かどうかを選んでください', []);
        return false;
      }
      clearError('b-error-1', []);
      return true;
    }

    /* ② カレンダー */
    function renderCalendar(focusKey) {
      var y = viewMonth.getFullYear();
      var m = viewMonth.getMonth();
      monthLabel.textContent = y + '年' + (m + 1) + '月';
      prevBtn.disabled = viewMonth <= new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      nextBtn.disabled = viewMonth >= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

      calBody.innerHTML = '';
      var offset = new Date(y, m, 1).getDay();
      var days = new Date(y, m + 1, 0).getDate();
      var tr = document.createElement('tr');
      for (var i = 0; i < offset; i++) tr.appendChild(document.createElement('td'));

      for (var day = 1; day <= days; day++) {
        if (tr.children.length === 7) {
          calBody.appendChild(tr);
          tr = document.createElement('tr');
        }
        var d = new Date(y, m, day);
        var st = dayStatus(d);
        var td = document.createElement('td');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cal__day is-' + st;
        btn.setAttribute('data-date', toKey(d));
        btn.setAttribute('aria-label', fmtDate(d) + '　' + STATUS[st].label);
        btn.setAttribute('aria-pressed', sameDay(d, state.date) ? 'true' : 'false');
        btn.tabIndex = -1;
        if (!(st === 'open' || st === 'few')) btn.disabled = true;

        var num = document.createElement('span');
        num.className = 'cal__num';
        num.textContent = day;
        var mark = document.createElement('span');
        mark.className = 'cal__mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = STATUS[st].mark || ' ';
        btn.appendChild(num);
        btn.appendChild(mark);
        td.appendChild(btn);
        tr.appendChild(td);
      }
      while (tr.children.length < 7) tr.appendChild(document.createElement('td'));
      calBody.appendChild(tr);

      // Tab キーで入れるのは1つだけ（選んだ日か、その月の最初の選べる日）。あとは矢印キーで動かす
      var target = (focusKey && calBody.querySelector('[data-date="' + focusKey + '"]:not([disabled])')) ||
        calBody.querySelector('.cal__day[aria-pressed="true"]:not([disabled])') ||
        calBody.querySelector('.cal__day:not([disabled])');
      if (target) {
        target.tabIndex = 0;
        if (focusKey) target.focus();
      }
    }

    function moveMonth(diff) {
      viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + diff, 1);
      renderCalendar();
    }

    prevBtn.addEventListener('click', function () { moveMonth(-1); });
    nextBtn.addEventListener('click', function () { moveMonth(1); });

    calBody.addEventListener('click', function (e) {
      var btn = e.target.closest('.cal__day');
      if (!btn || btn.disabled) return;
      state.date = fromKey(btn.getAttribute('data-date'));
      state.time = null;
      calBody.querySelectorAll('.cal__day').forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        b.tabIndex = b === btn ? 0 : -1;
      });
      clearError('b-error-2', []);
      updatePickedDate();
    });

    function findEnabled(start, step) {
      var c = start;
      while (c >= minDate && c <= maxDate) {
        if (isSelectable(c)) return c;
        c = addDays(c, step);
      }
      return null;
    }

    calBody.addEventListener('keydown', function (e) {
      var btn = e.target.closest('.cal__day');
      if (!btn) return;
      var delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (!delta) return;
      e.preventDefault();
      var from = fromKey(btn.getAttribute('data-date'));
      var next = findEnabled(addDays(from, delta), delta) ||
        findEnabled(addDays(from, delta), delta > 0 ? 1 : -1);
      if (!next) return;
      if (next.getMonth() !== viewMonth.getMonth() || next.getFullYear() !== viewMonth.getFullYear()) {
        viewMonth = new Date(next.getFullYear(), next.getMonth(), 1);
        renderCalendar(toKey(next));
        return;
      }
      var target = calBody.querySelector('[data-date="' + toKey(next) + '"]');
      calBody.querySelectorAll('.cal__day').forEach(function (b) { b.tabIndex = -1; });
      target.tabIndex = 0;
      target.focus();
    });

    function updatePickedDate() {
      pickedDate.textContent = state.date ? '選んだ日：' + fmtDate(state.date) : '';
    }

    function checkStep2() {
      if (!state.date) {
        showError('b-error-2', '日付を選んでください', []);
        return false;
      }
      clearError('b-error-2', []);
      return true;
    }

    /* ③ 時間 */
    function renderSlots() {
      slotLead.textContent = fmtDate(state.date) + '　' + MENUS[state.menu].label +
        (state.first === 'yes' ? '（はじめての方は＋15分）' : '') + 'で始められる時間です。';
      slotList.innerHTML = '';
      slotsFor(state.date).forEach(function (s) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot';
        btn.setAttribute('data-time', s.start);
        btn.setAttribute('aria-pressed', state.time === s.start ? 'true' : 'false');
        btn.setAttribute('aria-label', fmtTime(s.start) + 'から　' + (s.free ? '空きあり' : '予約ありのため選べません'));
        if (!s.free) btn.disabled = true;
        var time = document.createElement('span');
        time.className = 'slot__time';
        time.textContent = fmtTime(s.start);
        var mark = document.createElement('span');
        mark.className = 'slot__mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = s.free ? '○ 空き' : '× 予約あり';
        btn.appendChild(time);
        btn.appendChild(mark);
        li.appendChild(btn);
        slotList.appendChild(li);
      });
      updatePickedTime();
    }

    slotList.addEventListener('click', function (e) {
      var btn = e.target.closest('.slot');
      if (!btn || btn.disabled) return;
      state.time = Number(btn.getAttribute('data-time'));
      slotList.querySelectorAll('.slot').forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      clearError('b-error-3', []);
      updatePickedTime();
    });

    function timeRange() {
      return fmtTime(state.time) + '〜' + fmtTime(state.time + duration()) + 'ごろ（お茶の時間まで）';
    }

    function updatePickedTime() {
      pickedTime.textContent = state.time !== null ? '選んだ時間：' + timeRange() : '';
    }

    function checkStep3() {
      if (state.time === null) {
        showError('b-error-3', '時間を選んでください', []);
        return false;
      }
      clearError('b-error-3', []);
      return true;
    }

    /* ④ お名前・電話番号 */
    function checkStep4() {
      var first = null;
      if (nameInput.value.trim() === '') {
        showError('b-name-error', 'お名前を入力してください', [nameInput]);
        first = first || nameInput;
      } else {
        clearError('b-name-error', [nameInput]);
      }
      // 電話番号とメールアドレスは任意。どちらか一方は必須（ボスの回答 J-15）
      var tel = telInput.value.trim();
      var email = emailInput.value.trim();
      clearError('b-tel-error', [telInput]);
      clearError('b-email-error', [emailInput]);
      if (tel === '' && email === '') {
        showError('b-contact-error', '電話番号かメールアドレスの、どちらかを入力してください', [telInput, emailInput]);
        first = first || telInput;
      } else {
        clearError('b-contact-error', [telInput, emailInput]);
        if (tel !== '' && (countDigits(tel) < 10 || countDigits(tel) > 11 || /[^0-9０-９\-－ー\s]/.test(tel))) {
          showError('b-tel-error', '電話番号を、数字10けたか11けたで入力してください', [telInput]);
          first = first || telInput;
        }
        if (email !== '' && emailInput.validity.typeMismatch) {
          showError('b-email-error', 'メールアドレスを正しい形で入力してください', [emailInput]);
          first = first || emailInput;
        }
      }
      if (!privacyCheck.checked) {
        showError('b-privacy-error', '個人情報の取扱いへの同意にチェックを入れてください', [privacyCheck]);
        first = first || privacyCheck;
      } else {
        clearError('b-privacy-error', [privacyCheck]);
      }
      if (first) {
        first.focus();
        return false;
      }
      return true;
    }

    /* ⑤ 確認 */
    function addRow(label, value, className) {
      var div = document.createElement('div');
      if (className) div.className = className;
      var dt = document.createElement('dt');
      dt.textContent = label;
      var dd = document.createElement('dd');
      dd.textContent = value;
      div.appendChild(dt);
      div.appendChild(dd);
      confirmList.appendChild(div);
    }

    function renderConfirm() {
      confirmList.innerHTML = '';
      addRow('メニュー', MENUS[state.menu].label);
      addRow('ご来店', state.first === 'yes' ? 'はじめて（お話をうかがう時間を足します）' : '2回目以降');
      addRow('日時', fmtDate(state.date) + '　' + timeRange());
      addRow('お名前', nameInput.value.trim());
      addRow('電話番号', telInput.value.trim() || 'なし');
      addRow('メール', emailInput.value.trim() || 'なし');
      addRow('伝えておきたいこと', noteInput.value.trim() || 'なし');
      addRow('お会計（税込）', yen(MENUS[state.menu].price), 'confirm-total');
    }

    /* ⑥ ここまで：入力した内容を消す */
    function clearAll() {
      form.reset();
      resetState();
      confirmList.innerHTML = '';
      slotList.innerHTML = '';
      pickedDate.textContent = '';
      pickedTime.textContent = '';
      [nameInput, telInput, emailInput, privacyCheck].forEach(function (el) { el.removeAttribute('aria-invalid'); });
      ['b-name-error', 'b-tel-error', 'b-email-error', 'b-contact-error', 'b-privacy-error', 'b-error-1', 'b-error-2', 'b-error-3'].forEach(function (id) {
        clearError(id, []);
      });
    }

    var checks = { 1: checkStep1, 2: checkStep2, 3: checkStep3, 4: checkStep4 };

    form.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.hasAttribute('data-next')) {
        if (checks[current] && !checks[current]()) return;
        goTo(current + 1);
      } else if (btn.hasAttribute('data-back')) {
        goTo(current - 1);
      } else if (btn.hasAttribute('data-goto')) {
        goTo(Number(btn.getAttribute('data-goto')));
      } else if (btn.hasAttribute('data-restart')) {
        clearAll();
        goTo(1);
      }
    });

    // Enter キーなどで送信されたとき：⑤では「ここまで」へ、それ以外では次へ進む。どこにも送信しない
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (current === 5) {
        goTo(6);
        return;
      }
      if (checks[current] && !checks[current]()) return;
      if (current < 5) goTo(current + 1);
    });

    // ブラウザの「戻る」で戻ってきたときも、前の入力を残さない
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        clearAll();
        goTo(1, { focus: false });
      }
    });

    clearAll();
    goTo(1, { focus: false });
  }

  /* ---------- ご質問だけのお問い合わせフォーム（どこにも送信しない） ---------- */
  var qForm = document.getElementById('question-form');
  if (qForm) initQuestionForm(qForm);

  function initQuestionForm(form) {
    var statusBox = document.getElementById('q-status');
    var SAMPLE_MESSAGE = 'このサイトは制作サンプルのため、入力内容は送信されません。実際のお問い合わせはできませんので、ご了承ください。';
    var nameInput = document.getElementById('q-name');
    var telInput = document.getElementById('q-tel');
    var emailInput = document.getElementById('q-email');
    var messageInput = document.getElementById('q-message');
    var privacyCheck = document.getElementById('q-privacy');

    var checks = [
      function () {
        if (nameInput.value.trim() === '') {
          showError('q-name-error', 'お名前を入力してください', [nameInput]);
          return nameInput;
        }
        clearError('q-name-error', [nameInput]);
      },
      function () {
        var tel = telInput.value.trim();
        var email = emailInput.value.trim();
        if (tel === '' && email === '') {
          clearError('q-email-error', []);
          showError('q-contact-error', '電話番号かメールアドレスの、どちらかを入力してください', [telInput, emailInput]);
          return telInput;
        }
        clearError('q-contact-error', [telInput, emailInput]);
        if (email !== '' && emailInput.validity.typeMismatch) {
          showError('q-email-error', 'メールアドレスを正しい形で入力してください', [emailInput]);
          return emailInput;
        }
        clearError('q-email-error', [emailInput]);
      },
      function () {
        if (messageInput.value.trim() === '') {
          showError('q-message-error', 'ご質問を入力してください', [messageInput]);
          return messageInput;
        }
        clearError('q-message-error', [messageInput]);
      },
      function () {
        if (!privacyCheck.checked) {
          showError('q-privacy-error', '個人情報の取扱いへの同意にチェックを入れてください', [privacyCheck]);
          return privacyCheck;
        }
        clearError('q-privacy-error', [privacyCheck]);
      }
    ];

    var submitted = false;

    function validateAll() {
      var first = null;
      checks.forEach(function (check) {
        var bad = check();
        if (bad && !first) first = bad;
      });
      return first;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitted = true;
      statusBox.textContent = '';
      var firstError = validateAll();
      if (firstError) {
        var target = firstError.closest('.form-field, .form-group') || firstError;
        target.scrollIntoView({ block: 'start' });
        firstError.focus({ preventScroll: true });
        return;
      }
      // 送信しない。入力した内容も残さない
      form.reset();
      submitted = false;
      statusBox.textContent = SAMPLE_MESSAGE;
      statusBox.scrollIntoView({ block: 'center' });
    });

    form.addEventListener('input', function () {
      if (submitted) validateAll();
    });
    form.addEventListener('change', function () {
      if (submitted) validateAll();
    });
  }
})();
